# Architecture

Pride Born Ventures is a Next.js 16 App Router app deployed on Vercel with Firebase as the backend (Auth, Firestore, Cloud Functions, Storage). The frontend serves both the marketing site and the authenticated dashboard from the same codebase.

## System diagram (request flow)

```
                 ┌─────────────────────────────────────────┐
                 │                 Browser                 │
                 │  Next.js pages · Firebase Web SDK       │
                 └──────────┬───────────────────┬──────────┘
                            │                   │
                 HTTPS      │                   │ gRPC/WebSocket
                            ▼                   ▼
           ┌──────────────────────┐     ┌────────────────────────┐
           │  Vercel (Next.js 16) │     │  Firestore             │
           │  · SSR / RSC         │     │  (org-scoped reads via │
           │  · Route handlers    │     │   onSnapshot listeners)│
           │  · Proxy (auth gate) │     └─────────┬──────────────┘
           └────┬──────────┬──────┘               │
                │          │  Admin SDK           │
                │          │                      │
                │          ▼                      ▼
                │    ┌──────────────────────────────────────────┐
                │    │  Firebase services                       │
                │    │                                          │
                │    │  ├─ Auth (sessions + ID tokens)          │
                │    │  ├─ Firestore (data)                     │
                │    │  ├─ Storage (CSV exports, templates)     │
                │    │  └─ Cloud Functions (triggers + crons)   │
                │    └──────────────────────────────────────────┘
                │
                │  Third-party integrations (server-to-server)
                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  AudienceLab  ·  Stripe  ·  Postmark  ·  Twilio              │
  │  Meta Marketing API  ·  Google Ads API                       │
  └──────────────────────────────────────────────────────────────┘
```

## Tech boundary: who owns what

**Next.js route handlers (run on Vercel)** own:
- Third-party API proxying that requires provider secrets (`AUDIENCELAB_API_KEY`, `STRIPE_SECRET_KEY`, etc.). These secrets live in Vercel env vars; keeping the calls there avoids duplicating secret management in Firebase.
- Pixel and Stripe webhook ingestion (low latency, co-located with the user-facing app).
- Session cookie issuance ([`app/api/auth/session/route.js`](../app/api/auth/session/route.js)).

**Cloud Functions** own:
- Firestore/Auth triggers that should live next to the data: `onUserCreate` → seed user doc, `onOrgCreated` → seed membership + credits, `onLeadCreated` → hash+DNC+usage, `onDealWritten` → activity log on stage changes.
- Scheduled jobs: `scheduledUsageRollup` (daily), `scheduledCampaignSender` (every 5 minutes).
- Stripe Extension hooks (Phase 3).

**Firestore client SDK (in the browser)** owns:
- Authenticated org-scoped reads via `onSnapshot` listeners (leads list, deals Kanban, campaign list, visitor feed).
- Small, rules-validated mutations (dragging a deal across stages updates `deals/{id}.stage` directly; server-side validation would add latency without meaningful safety because the rules already constrain stage + role + org).

**Admin SDK from Next.js routes** owns:
- Any write that must be validated server-side: create audience, pull leads, export CSV, consume credits, push ad sync.

### Rule of thumb
**Read from client. Write from server.** Exception: pure role/stage validation writes that the rules can cheaply enforce.

## Directory layout

```
pride-born/
├── app/                    # Next.js App Router pages + API routes
│   ├── (marketing)         # implicit: /, /features, /industries, /pricing, /about
│   ├── dashboard/          # Authed single-page dashboard (client component)
│   ├── login/              # Sign-in page
│   ├── signup/             # Sign-up page
│   ├── onboarding/         # Create first org
│   ├── providers/          # AuthProvider client context
│   ├── api/                # Route handlers (Node runtime)
│   │   ├── auth/session/   # Session cookie issuance + logout
│   │   ├── orgs/           # Org CRUD
│   │   ├── health/         # Uptime probe
│   │   ├── audiencelab/    # AudienceLab proxy (Phase 2 → migrate to /api/audiences)
│   │   └── webhook/        # Inbound webhooks (pixel, AudienceLab)
│   ├── components/         # Shared UI (Nav, Footer, AuthShell)
│   ├── theme.js            # Color + font tokens (inline-style theme)
│   ├── globals.css         # Reset + animations
│   ├── layout.js           # Root layout wraps children in <AuthProvider>
│   ├── robots.js · sitemap.js · not-found.jsx · icon.svg
│
├── lib/
│   ├── firebase/
│   │   ├── client.js       # Web SDK + emulator detection
│   │   ├── admin.js        # Admin SDK (server-only)
│   │   └── session.js      # Session cookie helpers
│   └── hooks/
│       ├── useAuth.js
│       └── useFirestore.js
│
├── functions/              # Cloud Functions (ESM, Node 22)
│   └── src/
│       ├── admin.js
│       ├── index.js
│       ├── triggers/
│       │   ├── onUserCreate.js
│       │   ├── onOrgCreated.js
│       │   ├── onLeadCreated.js
│       │   └── onDealWritten.js
│       └── scheduled/
│           ├── usageRollup.js
│           └── campaignSender.js
│
├── docs/                   # This directory
├── firebase.json           # Emulators + deploy config
├── .firebaserc             # Project aliases (default, staging, production)
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Composite indexes
├── storage.rules           # Storage rules
├── proxy.js                # Edge proxy — session presence check on /dashboard/**
├── next.config.mjs
└── package.json
```

## Multi-tenant data model

Everything business-relevant is scoped to an org. The shape is:

```
orgs/{orgId}
  └── memberships/{userId}   ← membership gates all access via security rules
  └── audiences/{audienceId}
  └── leads/{leadId}
  └── visitors/{visitorId}
  └── campaigns/{campaignId}
  └── deals/{dealId}
  └── activities/{activityId}
  └── usage/{yyyymm}
  └── ...
```

A user may belong to many orgs. `users/{uid}.defaultOrgId` is the active workspace in the UI; the user can switch between orgs they are a member of.

See [`data-model.md`](./data-model.md) for the full schema and indexes.

## Auth flow

1. User signs in via Firebase Auth (email/password or Google OAuth) — [`app/login/page.jsx`](../app/login/page.jsx), [`app/signup/page.jsx`](../app/signup/page.jsx).
2. Client gets the ID token and POSTs it to [`/api/auth/session`](../app/api/auth/session/route.js).
3. The route handler verifies the token via Admin SDK, creates a session cookie (`createSessionCookie`, 5-day expiry), and sets it as httpOnly `__session`.
4. [`proxy.js`](../proxy.js) runs on `/dashboard/**` and `/onboarding` — it does a cheap presence check on the cookie (Edge runtime, no SDK needed). Full verification happens in route handlers via [`getAuthedUser()`](../lib/firebase/session.js) when required.
5. Sign-out clears the cookie (DELETE on the same route) and calls `fbSignOut` on the client.

See [`security.md`](./security.md) for the full auth + rules story.

## Request lifecycle examples

### Signing up a new user
1. `/signup` → `createUserWithEmailAndPassword` → Firebase Auth
2. Auth trigger `onUserCreate` → writes `users/{uid}` doc
3. Client POST `/api/auth/session` → session cookie set
4. Redirect to `/onboarding` → user names their org → POST `/api/orgs`
5. `onOrgCreated` trigger → seeds owner membership, initial usage doc, writes plan defaults back to org
6. Client redirects to `/dashboard`

### Pulling leads (Phase 2, post-AudienceLab key)
1. Dashboard → `POST /api/leads/pull` with `audienceId`
2. Route handler (Admin SDK) verifies session + membership + credit balance
3. Calls AudienceLab v3 → receives records
4. Batch-writes to `orgs/{orgId}/leads`
5. `onLeadCreated` trigger fires per lead → hash email/phone, DNC check, increment usage, decrement credits transactionally
6. Client `onSnapshot` on `orgs/{orgId}/leads` updates the table in real time

### Dragging a deal
1. User drags card in CRM Kanban
2. Client `updateDoc(orgs/{orgId}/deals/{dealId}, { stage: "contacted", updatedAt })`
3. Rules enforce: member + valid stage + only `stage`/`updatedAt` fields changing
4. `onDealWritten` trigger appends an activity record

## Why not ___?

- **Why not Tailwind?** The inline-style theme ([`app/theme.js`](../app/theme.js)) is the design system; see CLAUDE.md-equivalent guidance — keep it as-is.
- **Why not Clerk?** Firebase Auth works, one fewer vendor, one fewer bill.
- **Why not Postgres (Neon)?** Firestore fits the CRM/leads shape at MVP scale. Revisit past 10M+ leads.
- **Why not put AudienceLab calls in Cloud Functions?** Their API key lives in Vercel env (where the rest of the provider secrets live). Keeping it in Next.js routes avoids duplicating secret plumbing across two platforms.
- **Why not Vercel's built-in data (Blob/KV)?** KV and Postgres are no longer offered; Blob is on the table, but Firestore fills the primary-database role. Vercel Blob may be used for `templates/` and `avatars/` if/when we want to reduce Firebase Storage billing — not in MVP.

## Related docs

- [data-model.md](./data-model.md) — collections, fields, indexes
- [security.md](./security.md) — rules + PII + compliance
- [development.md](./development.md) — getting the emulator running
- [deployment.md](./deployment.md) — ship it
