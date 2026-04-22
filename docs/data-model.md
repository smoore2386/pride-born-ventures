# Data Model

All business data lives under `orgs/{orgId}`. `users/{uid}` is the only user-private top-level collection. `dncRegistry` is a cross-org cache of known DNC phone hashes.

## Top-level collections

### `users/{userId}`
User profile — editable by the user, referenced by `ownerUserId` on orgs.

| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | from Auth, not writable by client |
| `displayName` | string | optional |
| `photoURL` | string | optional |
| `defaultOrgId` | string | active workspace; set after onboarding |
| `createdAt` | Timestamp | server-set on create |
| `lastLoginAt` | Timestamp | updated on login |

Writes: only the user themselves via rules; `email` + `createdAt` are immutable from client.

### `orgs/{orgId}`
Workspace root.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | display name |
| `slug` | string | URL-safe |
| `industry` | string | `home`, `legal`, `medspa`, `insurance`, `agency`, `other` |
| `plan` | string | `starter`, `growth`, `scale`; server-only |
| `stripeCustomerId` | string | server-only |
| `stripeSubscriptionId` | string | server-only |
| `leadCreditsTotal` | number | server-only; seeded by `onOrgCreated` |
| `leadCreditsUsed` | number | server-only; incremented by `onLeadCreated` |
| `leadCreditsResetAt` | Timestamp | server-only |
| `audienceLabKeyRef` | string | path to Secret Manager; NOT the key itself |
| `pixelId` | string | provisioned at org creation |
| `pixelDomain` | string | white-label domain |
| `ownerUserId` | string | immutable |
| `createdAt` | Timestamp | server-set |

### `dncRegistry/{phoneHash}`
Cross-org DNC cache — keyed by SHA256 hash of the E.164 phone number.

| Field | Type |
| --- | --- |
| `source` | string (`audiencelab`, `manual`, `carrier`) |
| `addedAt` | Timestamp |

Read-only from client; writes via Admin SDK or Cloud Functions.

## Subcollections of `orgs/{orgId}`

### `memberships/{userId}`
Gates every other read/write via rules.

| Field | Type |
| --- | --- |
| `role` | `owner` \| `admin` \| `member` \| `viewer` |
| `status` | `active` \| `invited` \| `disabled` |
| `invitedBy` | string (userId) |
| `joinedAt` | Timestamp |

### `invitations/{inviteId}`
Pending team invites. Append-only; to change an invite, delete and re-issue.

| Field | Type |
| --- | --- |
| `email`, `role`, `token`, `expiresAt`, `invitedBy`, `status` | — |

### `audiences/{audienceId}`
User-defined filter stacks saved for reuse.

| Field | Type |
| --- | --- |
| `name` | string |
| `industry` | string |
| `filters` | map (keyed filter definition; see [api.md](./api.md)) |
| `audienceLabAudienceId` | string (external ref) |
| `estimatedSize` | number |
| `actualSize` | number |
| `status` | `draft` \| `building` \| `ready` \| `failed` |
| `createdBy`, `createdAt`, `lastPulledAt` | — |

### `leads/{leadId}`
The core record. Writes happen via Admin SDK only; clients may only update a whitelist of fields (`status`, `tags`, `notes`, `assignedTo`, `updatedAt`) — see rules.

| Field | Type | Notes |
| --- | --- | --- |
| `audienceId` | string | source audience, null for pixel-sourced |
| `source` | `audience` \| `pixel` \| `import` \| `manual` | |
| `firstName`, `lastName` | string | |
| `email` | string | raw |
| `emailLower` | string | normalized, used for dedup queries |
| `emailHash` | string | SHA256 of lowercased email, for ad sync |
| `emailValid` | `Valid` \| `Risky` \| `Unknown` | |
| `phone` | string | display form |
| `phoneE164` | string | normalized |
| `phoneHash` | string | SHA256 of E.164 |
| `phoneValid` | bool | |
| `dnc` | bool | server-set in `onLeadCreated` |
| `address`, `city`, `state`, `zip` | strings | |
| `age`, `gender`, `income`, `homeowner` | demographics | |
| `enrichedAt`, `exportedAt` | Timestamp | |
| `status` | `new` \| `contacted` \| `qualified` \| `closed` | |
| `tags` | string[] | |
| `dealId` | string | if promoted to a deal |
| `createdAt`, `updatedAt` | Timestamp | |

### `visitors/{visitorId}`
Pixel-captured sessions.

| Field | Type |
| --- | --- |
| `pixelId`, `ipHash`, `userAgent`, `referrer`, `landingPath` | — |
| `pages` | array of `{ path, at }` |
| `matched` | bool |
| `matchedLeadId` | string (if `matched`) |
| `firstSeenAt`, `lastSeenAt`, `sessionCount` | — |

### `campaigns/{campaignId}` + `campaigns/{campaignId}/sends/{sendId}`

Campaign-level stats plus per-send records.

**Campaign:**
- `name`, `channel` (`email` \| `sms`), `subject`, `body`, `audienceRefs[]`, `leadFilter`
- `status` — `draft` \| `scheduled` \| `sending` \| `sent` \| `paused`
- `scheduledAt`, `sentAt`
- `stats` — `{ sent, delivered, bounced, opened, clicked, unsubscribed, replied }`

**Send:**
- `leadId`, `channel`, `providerMessageId`, `status`, `timeline` (event log)

### `deals/{dealId}`
Pipeline stage cards.

- `leadId`, `title`, `value`, `owner` (userId)
- `stage` — enum: `new` \| `contacted` \| `qualified` \| `closed_won` \| `closed_lost`
- `nextActionAt`
- `createdAt`, `updatedAt`, `closedAt`

Clients can write `stage`/`updatedAt`; rules enforce the allowed stage enum. The `onDealWritten` function appends an activity on stage change and sets `closedAt` on `closed_won`.

### `activities/{activityId}`
Append-only audit + feed.

- `entityType` — `lead` \| `deal` \| `campaign`
- `entityId`
- `kind` — `note` \| `email_sent` \| `sms_sent` \| `call` \| `stage_change` \| `export` \| `deal_created`
- `actor` — userId or `system`
- `body`, `meta`, `at`

### `adSyncs/{syncId}`
Ad platform sync history.

- `destination` — `meta` \| `google`
- `externalAudienceId`, `leadCount`, `status`, `lastSyncedAt`, `error`

### `exports/{exportId}`
CSV export records. Clients read via signed URL returned from the export API.

- `kind` — `leads_csv` \| `campaign_report`
- `status`, `storagePath`, `rowCount`, `requestedBy`, `createdAt`, `expiresAt`

### `webhooks/{webhookId}`
Inbound webhook log (system-written).

- `source` — `audiencelab` \| `stripe` \| `twilio` \| `postmark`
- `payloadSnippet`, `status`, `processedAt`, `error`

### `usage/{yyyymm}`
Monthly counters — one doc per org per month, updated via `FieldValue.increment`.

- `leadsImported`, `emailsSent`, `smsSent`, `adSyncs`, `apiCalls`
- `createdAt`, `lastRolledAt`

### `subscriptions/{subId}`
Managed by the Firebase Stripe Extension — mirrors Stripe subscription state. Read-only to admins; never written by app code.

## Indexes

Composite indexes live in [firestore.indexes.json](../firestore.indexes.json). The essentials:

| Collection | Fields |
| --- | --- |
| `leads` | `status` ASC + `createdAt` DESC |
| `leads` | `audienceId` ASC + `createdAt` DESC |
| `leads` | `source` ASC + `createdAt` DESC |
| `deals` | `stage` ASC + `updatedAt` DESC |
| `visitors` | `matched` ASC + `lastSeenAt` DESC |
| `campaigns` | `status` ASC + `scheduledAt` ASC |
| `activities` | `entityId` ASC + `at` DESC |

Run `firebase deploy --only firestore:indexes` after changing.

## Data lifecycle invariants

- **Credits decrement** is transactional inside `onLeadCreated` to avoid race conditions when multiple leads arrive in parallel.
- **Lead hashing** (`emailHash`, `phoneHash`) is idempotent — trigger re-running is safe.
- **DNC seed**: every lead check hits `dncRegistry/{phoneHash}` before the first outreach; pre-populated by AudienceLab webhook.
- **Deals are not deleted on lead deletion** — `dealId` on the lead is the forward reference; orphaned deals are acceptable and surface in the CRM as "lead removed" cards.
- **Activities are append-only** — rules disallow updates and deletes; history is forever.

## Related docs

- [security.md](./security.md) — rules and PII handling
- [api.md](./api.md) — how HTTP routes touch this schema
- [development.md](./development.md) — seeding fixtures in the emulator
