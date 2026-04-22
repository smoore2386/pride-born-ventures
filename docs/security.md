# Security

This doc covers: authentication, session handling, Firestore/Storage rules, PII handling, and compliance posture (CAN-SPAM, TCPA, DNC).

## Authentication

Firebase Auth is the identity provider. Supported methods:
- **Email + password** — default for self-serve signup
- **Google OAuth** — one-click sign-in via `signInWithPopup`

Additional providers (Apple, SSO/SAML on Scale tier) are roadmap.

### Session flow

1. Client signs in via the Firebase Web SDK ([`lib/firebase/client.js`](../lib/firebase/client.js)).
2. Client calls `user.getIdToken(true)` and POSTs the token to [`/api/auth/session`](../app/api/auth/session/route.js).
3. The server verifies the token via Admin SDK's `createSessionCookie` (5-day expiry).
4. The server sets `__session` — **httpOnly**, **secure** (in production), `SameSite=Lax`, path=`/`.
5. All subsequent authenticated requests go through [`proxy.js`](../proxy.js) (presence check) or [`getAuthedUser()`](../lib/firebase/session.js) (full verification) for sensitive route handlers.

Why session cookies instead of bearer tokens? They're the standard Firebase pattern for Next.js: httpOnly prevents XSS exfiltration, `SameSite=Lax` blocks CSRF on cross-origin POSTs, and the server can verify cookies in Node route handlers without exposing secrets to the browser.

### Proxy (formerly middleware)

[`proxy.js`](../proxy.js) runs on Vercel's Edge runtime. It does **not** decode the session cookie — that would require the Admin SDK, which is Node-only. Instead it does a cheap presence check:

```js
if (!session) return NextResponse.redirect('/login?next=...');
```

Full cryptographic verification happens in Node runtime route handlers via `getAuthedUser()`. This keeps the proxy fast (Edge is cheaper and globally distributed) while keeping trust server-side.

## Firestore security rules

Full rules: [`firestore.rules`](../firestore.rules). Core idea:

- **`isMember(orgId)`** — gate every org-scoped subcollection read/write.
- **`hasRole(orgId, [...])`** — restrict mutations of members, invitations, audiences, campaigns, settings to `owner`/`admin`.
- **`mutatesProtectedOrgFields()`** — clients may never write `plan`, `leadCreditsTotal`, `leadCreditsUsed`, `stripeCustomerId`, `stripeSubscriptionId`, or `audienceLabKeyRef`. These are server-only via the Admin SDK.

### Server-only writes

Some collections have **all writes disabled from the client**:

| Collection | Why |
| --- | --- |
| `orgs/{orgId}/leads` | Created via Admin SDK after AudienceLab pull — prevents client-side credit bypass |
| `orgs/{orgId}/visitors` | Written by pixel webhook only |
| `orgs/{orgId}/campaigns/{id}/sends` | Written by Cloud Function scheduler |
| `orgs/{orgId}/adSyncs` | Written by ad sync API route |
| `orgs/{orgId}/exports` | Written by export API route |
| `orgs/{orgId}/webhooks` | System logs |
| `orgs/{orgId}/usage` | Written by triggers + scheduled rollup |
| `orgs/{orgId}/subscriptions` | Managed by Stripe Extension |

### Client-writable collections

- `orgs/{orgId}/deals` — clients may create/update deals. Rules enforce the allowed stage enum and require `leadId`, `stage`, `updatedAt`.
- `orgs/{orgId}/activities` — clients may append notes; rules block updates and deletes (append-only audit).
- `orgs/{orgId}/leads` — clients may update a narrow set of fields (`status`, `tags`, `notes`, `assignedTo`, `updatedAt`) but cannot create or delete.

### Testing rules

Use the emulator + `@firebase/rules-unit-testing` (to be added in Phase 6). Example test pattern:

```js
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
// ... set up test env, impersonate a user, assert expected behavior
```

Run tests via `firebase emulators:exec --only firestore "npm test"`.

## Storage rules

Full rules: [`storage.rules`](../storage.rules).

- `exports/{orgId}/*` — signed-URL read for org members; server-only write
- `templates/{orgId}/*` — read + write for org members (email templates with images)
- `avatars/{userId}/*` — read for any signed-in user, write only by the user

## PII handling

### At rest
- Firestore is **AES-256** encrypted by default. No additional app-level encryption for MVP.
- Sensitive identifiers (email, phone) are stored **in plaintext + as SHA256 hashes** — hashes are the only form sent to ad platforms (Meta Custom Audiences, Google Customer Match).

### In transit
- HTTPS everywhere (Vercel + Firebase default).
- Client → server: session cookies over HTTPS.
- Server → Firebase: authenticated gRPC / REST from the Admin SDK.
- Server → third parties: HTTPS with bearer token auth (AudienceLab, Postmark, Twilio, Stripe).

### Access controls
- Firestore rules enforce org-level isolation.
- No cross-org query is possible from client code without a bug in rules.
- Admin SDK operations are server-side only; keys never ship to the browser.

## Compliance posture

### CAN-SPAM (email)
- Mandatory physical mailing address in org settings — required before first email send.
- Every outbound email includes a `List-Unsubscribe` header (RFC 8058 one-click) and a body link pointing to `/api/unsubscribe?token=...`.
- Unsubscribe writes `leads.unsubscribedAt`; subsequent sends to that lead are blocked by the outreach pipeline.

### TCPA (SMS)
- Explicit opt-in required. Each lead has a `optedInAt` field with `optedInSource`. SMS sends filter to leads with a valid opt-in.
- STOP replies auto-write `leads.dnc = true` via the Twilio webhook handler.
- Quiet hours enforced per lead's timezone (server-side scheduler skips 9pm–8am local).

### DNC (phone)
- `dncRegistry/{phoneHash}` is a cross-org DNC cache seeded from AudienceLab's `DNC` field.
- On every `onLeadCreated`, the trigger checks the registry and sets `leads.dnc` accordingly.
- The outreach pipeline hard-blocks SMS to any lead with `dnc = true`.

### A2P 10DLC (SMS delivery)
- Twilio brand + campaign registration begins in Phase 1 (approval takes 1–3 weeks).
- SMS feature is gated behind an org flag (`smsApproved: true`) set after brand approval.

### Email authentication
- SPF, DKIM, DMARC DNS records required per sending domain.
- Postmark handles DKIM signing; SPF + DMARC are customer-configured.
- Settings UI surfaces the required DNS records and checks propagation before enabling sends.

### GDPR-adjacent
- We're US-focused today, but the schema supports right-to-delete via an Admin SDK soft-delete flow (`softDeletedAt` on the lead — not implemented in MVP).

## Secret management

### Vercel (frontend + route handlers)
- Scoped to Production / Preview / Development in the Vercel project settings.
- Never committed; [`.env.example`](../.env.example) documents names only.

### Firebase
- `FIREBASE_SERVICE_ACCOUNT_JSON` — base64-encoded service account JSON, set in Vercel env. Used by [`lib/firebase/admin.js`](../lib/firebase/admin.js).
- In emulator dev, service account is optional; the Admin SDK auto-detects emulator env via `FIRESTORE_EMULATOR_HOST`.

### Cloud Functions
- Cloud Functions auto-inject default credentials; no explicit service account needed.
- Third-party keys used in functions (e.g. Postmark for the campaign sender) are set via `firebase functions:config:set` or Secret Manager.

## Incident response summary

See [runbook.md](./runbook.md) for full detail. Short version:
1. **Suspected credential leak** — rotate in Vercel + Firebase immediately, invalidate affected Stripe keys, audit access logs.
2. **Data exfiltration alert** — disable the offending API key, review `webhooks` + `activities` audit trail, notify affected users per breach-notification policy.
3. **Ad platform sync issue** — inspect `adSyncs/{id}.error`; platforms can rate-limit during high-volume syncs.
