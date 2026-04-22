# Roadmap

Six phases, ~6 weeks solo, revenue starts at end of Phase 3.

Legend: ✅ shipped · 🏗 in progress · 📋 planned

## Phase 1 — Auth + Org + Emulator ✅

**Goal:** Users can sign up, create an org, see a gated dashboard. Everything runs against the Firebase emulator locally.

Shipped:
- Firebase config: [`firebase.json`](../firebase.json), [`.firebaserc`](../.firebaserc)
- Security rules + indexes: [`firestore.rules`](../firestore.rules), [`firestore.indexes.json`](../firestore.indexes.json), [`storage.rules`](../storage.rules)
- Cloud Functions scaffold: [`functions/src/`](../functions/src/) with `onUserCreate`, `onOrgCreated`, `onLeadCreated`, `onDealWritten`, `scheduledUsageRollup`, `scheduledCampaignSender`
- Client + Admin + Session libs: [`lib/firebase/`](../lib/firebase/)
- Auth pages: [`app/login`](../app/login), [`app/signup`](../app/signup), [`app/onboarding`](../app/onboarding)
- API routes: [`/api/auth/session`](../app/api/auth/session), [`/api/orgs`](../app/api/orgs), [`/api/health`](../app/api/health)
- Proxy-based auth gate: [`proxy.js`](../proxy.js)
- `AuthProvider` + `useAuth` hook wired into root layout
- Emulator scripts: `npm run dev:all`, `dev:emulators`, `emulators:export`, `emulators:import`

## Phase 2 — Audience + Leads + Pixel 📋

**Goal:** A real user with an AudienceLab key can build an audience, pull leads, install the pixel, see visitors in real time.

Planned:
- `POST /api/audiences` — create audience, kick off AudienceLab build
- `GET /api/audiences/[id]` — status + estimate polling
- `POST /api/leads/pull` — fetch matched records, batch write, decrement credits
- `POST /api/leads/export` — CSV to Storage + signed URL
- `POST /api/webhook/pixel` — SuperPixel event ingest, upsert visitor, match to leads
- Dashboard surface: strip `SAMPLE_LEADS` in [`app/dashboard/page.jsx`](../app/dashboard/page.jsx), split views into `app/dashboard/_views/*`, consume `useFirestoreCollection` for live data
- Dev-only `/api/dev/seed` for fixture data when no AudienceLab key is present

**Effort:** 5–7 days

## Phase 3 — Billing 📋

**Goal:** Subscriptions work. Plan gates enforced. Lead credits tracked. **First revenue.**

Planned:
- Install Firebase Stripe Extension (Run Payments with Stripe)
- Stripe products: `starter_monthly`, `growth_monthly`, `scale_monthly`, `overage_credits` (metered)
- `POST /api/billing/checkout` → creates checkout session doc → extension returns URL → redirect
- `POST /api/billing/portal` → customer portal session
- `onSubscriptionWrite` Cloud Function — mirror Stripe plan to `orgs.plan`
- Metered overage reporting: nightly function sends usage to Stripe `subscriptionItems.createUsageRecord`
- Lead credit enforcement in `/api/leads/pull` (transactional decrement, block at 0 for Starter)
- Pricing page CTA → checkout
- Upgrade banner in dashboard at >80% credit usage

**Effort:** 3–5 days

## Phase 4 — Outreach (Email + SMS) 📋

**Goal:** Customers send compliant email + SMS campaigns. Expansion revenue kicks in.

Planned:
- Postmark: domain auth, SPF/DKIM/DMARC setup flow, `POST /api/webhook/postmark`
- Twilio: A2P 10DLC brand + campaign registration (start in Phase 1 — approval takes 1–3 weeks), `POST /api/webhook/twilio`
- Campaign composer: email subject/body + SMS body, audience picker, schedule or send-now
- `POST /api/campaigns/send-now` → fan-out writes to `campaigns/{id}/sends`
- `scheduledCampaignSender` Cloud Function → picks up scheduled campaigns, fans out via Postmark/Twilio
- `POST /api/unsubscribe` public endpoint (token-gated)
- STOP reply auto-opt-out on SMS
- Quiet-hours scheduler (9pm–8am local)

**Effort:** 5–7 days (plus ~2 week A2P approval wait)

## Phase 5 — CRM + Ads + Compliance polish 📋

**Goal:** Full MVP surface. Close the loop.

Planned:
- Deals Kanban wired to Firestore — drag-drop updates `deals/{id}.stage` directly (rules-validated)
- `onDealWritten` activity logger (already scaffolded)
- Meta Marketing API integration: OAuth per org, `POST /api/ads/meta/sync` with SHA256-hashed email/phone/name
- Google Ads API integration: Customer Match, OAuth per org, `POST /api/ads/google/sync`
- Activities feed component in dashboard
- Deep compliance polish: unsubscribe link visibility, physical address requirement, DNS record validator

**Effort:** 5–7 days

## Phase 6 — Observability + Beta hardening 📋

**Goal:** Leave it alone overnight.

Planned:
- Sentry: `@sentry/nextjs` wizard + `@sentry/node` in functions
- PostHog: funnel (signup → audience built → lead pulled → campaign sent → subscription purchased)
- Vercel Analytics for marketing traffic
- `/api/health` → BetterStack / UptimeRobot monitor
- Security rules test suite with `@firebase/rules-unit-testing`
- Rate limits: token bucket per org on AudienceLab + ad syncs
- `scheduledDncRefresh` weekly
- [`docs/runbook.md`](./runbook.md) filled in with real incident playbooks

**Effort:** 3–4 days

## Post-MVP (weeks 7+)

- **Auth expansion:** Apple OAuth, magic link, WorkOS SSO for Scale tier
- **Team seats UI:** invite flow, role management
- **White-label:** custom subdomains, logo upload, agency sub-accounts
- **Reporting:** scheduled PDF exports, client-facing dashboards
- **Mobile:** React Native app for CRM-on-the-go
- **Internationalization:** Canada first (share of data partners + compliance frameworks), UK/AU later

## Decision log

Kept here so the reasoning doesn't get lost.

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-04-22 | Firebase over Clerk/Neon | Single vendor for auth+data, emulator story, Stripe Extension |
| 2026-04-22 | Keep inline-style theme | User directive; consistent across codebase |
| 2026-04-22 | Stripe via Firebase Extension | Avoids custom webhook wiring in MVP; straightforward to swap later |
| 2026-04-22 | Postmark + Twilio | Mature deliverability; Twilio A2P is longest lead time — start Phase 1 |
| 2026-04-22 | Hybrid client/server write model | Perf win on CRM drag; safety everywhere else |

## Out of scope (explicitly)

- Self-serve data partner swapping (we lock in AudienceLab for Year 1)
- On-prem / SOC 2 (Year 2 if enterprise traction emerges)
- Native mobile apps at MVP
- LinkedIn or TikTok ad sync (Meta + Google cover ~90% of target buyer ad spend)
- Full workflow automation a la Zapier (we expose webhooks instead)
