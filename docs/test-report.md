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

## 7. What I could NOT automate

These require a real browser (I don't have browser-control tools loaded). Recommended manual verification — should take ~5 minutes:

1. **Login page form submission** — open <http://localhost:3000/login>, submit with a seeded emulator user, confirm redirect to `/dashboard`.
2. **Signup page + onboarding** — `/signup` → `/onboarding` → enter workspace name → confirm dashboard loads with the correct org.
3. **Google OAuth popup** — not available in emulator (no real Google IdP); will be verified post-production-creds.
4. **Dashboard view switching** — click through all 8 sidebar items, confirm no JS errors in the console.
5. **Dashboard API-offline banner** — confirm the amber banner shows when AudienceLab isn't connected.
6. **Settings → API Connection → Test Connection** — clicking "Test Connection" with a bogus key returns a validation error (client-side stub; live flow comes in Phase 2).
7. **CRM Kanban drag (visual)** — layout renders; actual drag-drop isn't wired to Firestore until Phase 5.
8. **Marketing pages on mobile** — responsive check (inline styles use flex/grid with min-widths; should reflow but worth eyeballing).

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
