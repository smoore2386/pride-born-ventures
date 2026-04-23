# Test report — Phase 1 verification

**Date:** 2026-04-22
**Environment:** local dev, Firebase emulator suite + Next.js dev server
**Build:** `next build` 16.2.4, all routes compiled clean

Summary: **all automated checks passed.** A few items (Google OAuth popup, drag-drop interactions, real-time listener UX) can only be verified in a real browser and are called out at the bottom.

## 1. Build + lint

| Check | Result |
| --- | --- |
| `npm run build` — production build | ✅ compiles, 19 routes, TypeScript clean |
| `next lint` | ⚠ Next.js 16 removed `next lint`; ESLint config not yet set up. Not a regression from Phase 1. |

## 2. Prerequisites

| Check | Result |
| --- | --- |
| Node 22, npm 10 | ✅ |
| Firebase CLI 13.35.1 | ✅ |
| OpenJDK 21 (firebase-tools requires 21+) | ✅ installed via `brew install openjdk@21` |
| Cloud Functions deps installed | ✅ |
| Firebase emulators boot (auth, firestore, functions, storage, pub/sub, UI) | ✅ on ports 9099 / 8080 / 5001 / 9199 / 8085 / 4000 |
| Next.js dev server | ✅ on port 3000 |

## 3. Public routes (HTTP smoke)

| Route | Status | Title rendered |
| --- | --- | --- |
| `/` | 200 | ✅ |
| `/features` | 200 | ✅ |
| `/industries` | 200 | ✅ |
| `/pricing` | 200 | ✅ |
| `/about` | 200 | ✅ |
| `/login` | 200 | ✅ |
| `/signup` | 200 | ✅ |
| `/not-found` (404) | 404 | ✅ (proper not-found page) |
| `/robots.txt` | 200 | ✅ |
| `/sitemap.xml` | 200 | ✅ |
| `/icon.svg` | 200 | ✅ |

## 4. Auth gates

| Check | Expected | Result |
| --- | --- | --- |
| GET `/dashboard` without session | 307 → `/login?next=/dashboard` | ✅ |
| GET `/onboarding` without session | 307 → `/login?next=/onboarding` | ✅ |
| GET `/api/orgs` without session | 401 `{ok:false,error:"Not authenticated"}` | ✅ |
| POST `/api/orgs` without session | 401 | ✅ |
| POST `/api/auth/session` without `idToken` | 400 `Missing idToken` | ✅ |
| POST `/api/auth/session` with bad `idToken` | 401 | ✅ (admin SDK rejects) |

## 5. End-to-end signup flow

Script: [`scripts/smoke-e2e.mjs`](../scripts/smoke-e2e.mjs) — run with `node scripts/smoke-e2e.mjs`.

Exercises the real end-to-end path: create user in Auth emulator → POST idToken to `/api/auth/session` → cookie issued → GET /api/orgs (empty) → POST /api/orgs → verify Cloud Function triggers seeded expected state → GET /api/orgs again (has 1 org) → DELETE session.

| Step | Result |
| --- | --- |
| [1] Create user via Identity Toolkit REST | ✅ uid returned |
| [2] `onUserCreate` trigger seeded `users/{uid}` doc with email, displayName, createdAt, null defaultOrgId | ✅ within 500ms |
| [3] POST `/api/auth/session` → `__session` cookie set | ✅ |
| [4] GET `/api/orgs` before org creation → `[]` | ✅ |
| [5] POST `/api/orgs` → orgId returned | ✅ |
| [6] `onOrgCreated` trigger seeded membership (role=owner, status=active), `usage/{yyyymm}` (zeros), and mutated `orgs/{id}` with `leadCreditsTotal: 2500` (starter-plan default) | ✅ |
| [7] `onOrgCreated` also wrote `users/{uid}.defaultOrgId = orgId` | ✅ |
| [8] GET `/api/orgs` after → 1 org, role=owner | ✅ |
| [9] DELETE `/api/auth/session` clears cookie (`Expires=Thu, 01 Jan 1970`) | ✅ |

**All 9 E2E steps passed.**

## 6. Firestore security rules

Script: [`scripts/test-rules.mjs`](../scripts/test-rules.mjs) — uses `@firebase/rules-unit-testing` against the running emulator.

| Area | Check | Result |
| --- | --- | --- |
| Unauthenticated access | unauth GET `/orgs/org1` denied | ✅ |
| | unauth GET `/orgs/org1/leads/lead1` denied | ✅ |
| Cross-org isolation | outsider cannot read `/orgs/org1` | ✅ |
| | outsider cannot read `/orgs/org1/leads/lead1` | ✅ |
| Authorized reads | owner reads `/orgs/org1` | ✅ |
| | member reads `/orgs/org1/leads/lead1` | ✅ |
| Server-only writes | client CANNOT create a lead | ✅ |
| | client CANNOT delete a lead | ✅ |
| | client CANNOT write `visitors/*` | ✅ |
| | client CANNOT write `usage/*` | ✅ |
| Lead update whitelist | member CAN update (status, tags, updatedAt) | ✅ |
| | member CANNOT update `email` or other protected fields | ✅ |
| Protected org fields | admin CANNOT mutate `plan` from client | ✅ |
| | admin CANNOT mutate `leadCreditsTotal` from client | ✅ |
| | admin CAN update `name` | ✅ |
| Memberships (owner-only) | non-owner CANNOT modify memberships | ✅ |
| | owner CAN modify memberships | ✅ |
| Deals | member CAN create a valid deal | ✅ |
| | member CANNOT create a deal with invalid stage | ✅ |
| Activities (append-only) | member CAN create an activity | ✅ |
| | member CANNOT update an activity | ✅ |
| | member CANNOT delete an activity | ✅ |
| User profile | user CAN create own profile | ✅ |
| | user CANNOT read another user's profile | ✅ |

**22 / 22 rules checks passed.**

## 7. Browser verification (run 2026-04-22, via Chrome)

Test user created during this run: `qa-test-apr22@prideborn.test` (throwaway, lives in emulator auth store).

| # | Check | Result |
| --- | --- | --- |
| 1 | **Signup form** (`/signup`): fill name/email/password → submit | ✅ redirected to `/onboarding` |
| 2 | **Onboarding form**: workspace name "QA Test Workspace" + default "Home Services" industry → submit | ✅ redirected to `/dashboard` (org created, `onOrgCreated` triggered, `users/{uid}.defaultOrgId` populated) |
| 3 | **Login form** (`/login`): submit with the user from step 1 | ✅ session cookie set, redirected to `/dashboard` |
| 4 | **Login error path**: submit with wrong password | ✅ red error box shows `Firebase: Error (auth/wrong-password).`, stays on `/login` |
| 5 | **Auth gate**: GET `/dashboard` after `DELETE /api/auth/session` | ✅ redirected to `/login?next=/dashboard` |
| 6 | **8 dashboard views** — click each sidebar item | ✅ all render (Dashboard, Audience Builder, Lead Data, Visitor Tracking, Campaigns, CRM Pipeline, Ad Integration, Settings) |
| 7 | **Console sweep** across signup + onboarding + login + all 8 views + Settings interactions | ✅ **zero errors, zero warnings** |
| 8 | **Dashboard API-offline banner**: amber "API not connected" banner + top-right "API Offline" pill | ✅ both visible on default state |
| 9 | **Settings → Test Connection (empty key)** | ✅ shows `✗ Invalid API key. Get yours at app.audiencelab.io/account → API Keys` |
| 10 | **Settings → Test Connection (bogus key)** — expected: validation error per plan above | ⚠️ **Bug** — returns `✓ Connected to AudienceLab V3 — 14 audiences found` and flips the top-right pill to "API Live". Stub only guards empty input; any non-empty string passes. Tracked below. |
| 11 | **CRM Kanban visual** | ✅ 3 columns render (New Leads 4 / Contacted 3 / Closed Won 1), lead cards populated |
| 12 | **Google OAuth popup** | ⏭ skipped this pass (no real Google IdP; re-verify post-production-creds) |
| 13 | **Marketing pages on mobile** | ⚠️ not verified — the Chrome extension's `resize_window` only changes the window frame, not the rendering viewport (`innerWidth` stayed 1745 regardless). Code-level review: marketing pages use `repeat(auto-fit, minmax(180/220/260px, 1fr))` + `flexWrap: wrap` (should reflow cleanly); dashboard tables use fixed `fr`-column grids and will horizontal-scroll on mobile. Please eyeball in Chrome DevTools device mode. |

### Bugs found this pass

- **B1: Literal unicode escapes appear in rendered UI.** Several strings contain `\u2014`, `\u2192`, `\u00B7` as literal text instead of their actual characters (em-dash, right-arrow, middle-dot). Visible in at least: `AudienceBuilder` → "Pull Leads \u2192", "SKIPTRACE_MATCH_BY \u2014 higher accuracy…"; `LeadsView` subtitle "AudienceLab records \u2014 verified contacts…"; `VisitorView` subtitle "AudienceLab V3 SuperPixel \u2014 identify anonymous…"; CRM Kanban card "Austin, TX \u00B7 $85K-$100K"; `AdsView` "PI Leads \u2014 Central TX", "Med Spa \u2014 Women 25-45"; Settings helper "app.audiencelab.io/account \u2192 API Keys"; Dashboard banner "Go to Settings \u2192 API Connection". Contrast: the Test Connection error message does render `→` correctly, so this is an encoding issue in the source strings, not runtime. Likely a sed/ASCII-escaping pass that wasn't decoded. Fix: replace the literal `\uXXXX` text with the actual characters in `app/dashboard/page.jsx`.
- **B2: Test Connection stub accepts any non-empty API key.** See row 10 above. The client-side stub flips `connected = true` on any non-empty input — doesn't match the test-report expectation of "returns a validation error with a bogus key". Either update the expectation (this is intended stub behavior until Phase 2 hooks up real validation) or add a length / prefix check. Worth deciding now so the happy-path demo doesn't train the wrong mental model.
- **B3 (minor): Login ignores `?next=` query param.** `/login/page.jsx:39` hardcodes `router.push("/dashboard")` after a successful sign-in. The auth gate populates `?next=<path>` but login doesn't read it back. Fine while every protected route is `/dashboard`, but will bite when the first non-dashboard gated page ships.

## 8. Known warnings / follow-ups

- `npm install` reports 14 vulnerabilities (mostly transitive via `firebase-tools`). Not exploitable in dev; revisit before production deploy.
- `.env.local` is required for the Admin SDK to route to the emulator. Script behavior on a fresh checkout is: `cp .env.example .env.local` (documented in [development.md](./development.md)).
- ESLint config not set up in Next.js 16 (replaced old `next lint` with flat config). Low priority — `next build` still type-checks everything via the compiler.
- Peer-dep conflict between `@firebase/rules-unit-testing@5` and `firebase@11` — installed with `--legacy-peer-deps`. Safe for test code; does not affect production bundle.

## 9. How to re-run

```bash
# Terminal 1 — emulators
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
firebase emulators:start --project=pride-born-dev

# Terminal 2 — Next.js
npm run dev

# Terminal 3 — tests
node scripts/smoke-e2e.mjs      # 9 checks
node scripts/test-rules.mjs     # 22 checks
```

Or all-in-one: `npm run dev:all` + the two test scripts.
