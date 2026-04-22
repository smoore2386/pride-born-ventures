# API reference

All routes are Next.js App Router route handlers living under [`app/api/**/route.js`](../app/api). They run on the Node runtime (never Edge) because they use the Firebase Admin SDK.

**Auth:** all non-public routes expect the `__session` cookie. If missing/invalid, the response is `401 { ok: false, error: "Not authenticated" }`.

**Content type:** requests and responses are JSON unless noted.

## Auth

### `POST /api/auth/session`
Create a server session cookie from a Firebase ID token.

Request:
```json
{ "idToken": "<firebase ID token>" }
```

Responses:
- `200 { ok: true }` — cookie set
- `400 { ok: false, error: "Missing idToken" }`
- `401 { ok: false, error: "Invalid token" }`

### `DELETE /api/auth/session`
Clear the session cookie. Idempotent.

Response: `200 { ok: true }`

## Orgs

### `POST /api/orgs`
Create an org for the current user. Triggers `onOrgCreated` which seeds owner membership + initial usage doc.

Request:
```json
{ "name": "Acme HVAC", "industry": "home", "plan": "starter" }
```

Responses:
- `200 { ok: true, orgId: "..." }`
- `400 { ok: false, error: "Missing name" }`
- `401 { ok: false, error: "Not authenticated" }`

### `GET /api/orgs`
List the current user's orgs (where they have an active membership).

Response:
```json
{ "ok": true, "orgs": [{ "id": "...", "name": "...", "role": "owner", ... }] }
```

## Health

### `GET /api/health`
Uptime probe. No auth required.

Response:
```json
{
  "ok": true,
  "firestore": "up",
  "latencyMs": 42,
  "at": "2026-04-22T17:00:00.000Z"
}
```

`firestore` may be `"up"`, `"down: <error>"`, or `"unknown"`. Intended for BetterStack / UptimeRobot.

## AudienceLab (Phase 2 → will migrate)

These routes exist from the initial scaffold and will be superseded in Phase 2 by org-scoped `/api/audiences/*`.

### `POST /api/audiencelab/test`
Test an AudienceLab API key.

Request: `{ "apiKey": "<optional override>" }` — if omitted, uses `AUDIENCELAB_API_KEY` env.

Response:
- `200 { ok: true, audiencesFound: 14, msg: "Connected to AudienceLab — 14 audiences found" }`
- `400 { ok: false, error: "Missing AudienceLab API key" }`
- `5xx { ok: false, error: "..." }`

### `GET /api/audiencelab/audiences`
Proxy for AudienceLab's list audiences endpoint.

Response: `{ ok: true, data: <AudienceLab response> }` or `{ ok: false, error: "..." }`.

## Webhooks

### `POST /api/webhook/audiencelab`
Inbound webhook receiver for AudienceLab / AudienceSync CDP payloads. In Phase 2 this will be replaced by `POST /api/webhook/pixel`.

Auth: optional `Authorization: Bearer <AUDIENCELAB_WEBHOOK_SECRET>` header. If `AUDIENCELAB_WEBHOOK_SECRET` is unset, the route is open (dev convenience).

Request: AudienceLab-shaped lead JSON, e.g.:
```json
{
  "FIRST_NAME": "Sarah",
  "LAST_NAME": "Mitchell",
  "PERSONAL_EMAIL": "s.mitchell@gmail.com",
  "SKIPTRACE_WIRELESS_NUMBERS": "(512) 555-0142",
  "CITY": "Austin",
  "STATE": "TX",
  "DNC": "N"
}
```

Response: `{ ok: true, received: { ... normalized lead ... } }`.

### `GET /api/webhook/audiencelab`
Health check for the inbound webhook — returns a usage note for integrators.

## Roadmap routes (not yet implemented)

These will be added in the phases noted. Schemas will be documented here as they land.

| Route | Phase | Purpose |
| --- | --- | --- |
| `POST /api/audiences` | 2 | Create + kick off AudienceLab audience build |
| `GET /api/audiences/:id` | 2 | Fetch audience status + estimate |
| `POST /api/leads/pull` | 2 | Pull matched leads from AudienceLab, batch-write |
| `POST /api/leads/export` | 2 | CSV export → Storage + signed URL |
| `POST /api/webhook/pixel` | 2 | SuperPixel event ingest |
| `POST /api/campaigns/send-now` | 4 | Immediate send (bypasses scheduler) |
| `POST /api/webhook/postmark` | 4 | Delivery events (opens, clicks, bounces) |
| `POST /api/webhook/twilio` | 4 | SMS events + STOP handling |
| `POST /api/ads/meta/sync` | 5 | Push hashed audience to Meta Custom Audiences |
| `POST /api/ads/google/sync` | 5 | Push hashed audience to Google Customer Match |
| `POST /api/billing/checkout` | 3 | Create Stripe checkout session |
| `POST /api/billing/portal` | 3 | Create Stripe customer portal session |
| `POST /api/unsubscribe` | 4 | Public (token-gated) unsubscribe endpoint |

## Calling conventions

### Auth from the client

```js
// After sign-in:
const idToken = await user.getIdToken(true);
await fetch("/api/auth/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});

// Subsequent authed calls: cookie is sent automatically
const res = await fetch("/api/orgs");
```

### Auth from a route handler

```js
import { getAuthedUser } from "@/lib/firebase/session";

export async function POST(req) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  // ...
}
```

### Writing to Firestore from a route handler

```js
import { adminDb, FieldValue } from "@/lib/firebase/admin";

await adminDb.collection(`orgs/${orgId}/leads`).add({
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  createdAt: FieldValue.serverTimestamp(),
});
```

`onLeadCreated` will run automatically and handle hashing / DNC / credits.

## Error responses

All routes return a consistent shape on failure:

```json
{ "ok": false, "error": "human-readable message" }
```

HTTP status mapping:
- `400` — bad input
- `401` — not authenticated
- `403` — authenticated but not authorized (e.g. not a member of the org)
- `404` — resource not found
- `409` — conflict (duplicate org, invite already exists)
- `429` — rate limited
- `5xx` — server / upstream error

## Rate limits

No app-level rate limiting in MVP. Vercel's platform limits apply (function-level concurrency). A token-bucket per org for AudienceLab pulls and ad syncs will be added in Phase 6 to prevent a single customer from exhausting shared provider quotas.
