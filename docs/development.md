# Local development

The default dev setup is **emulator-first** — nothing requires real Firebase or AudienceLab credentials.

## Prerequisites

- **Node 22+** (`node -v` → `v22.x`). Node 18 is deprecated on Vercel.
- **npm 10+**. `pnpm` is not installed on the dev machine.
- **Firebase CLI** (`firebase-tools`) — installed as a dev dependency, run via `npx firebase` or the scripts below.
- **Java 11+** — required by the Firestore and pub/sub emulators. `brew install --cask temurin` on macOS.

## First-time setup

```bash
git clone https://github.com/smoore2386/pride-born-ventures.git
cd pride-born-ventures
npm install
cp .env.example .env.local
# (no changes needed for emulator-only dev)
```

## Running locally

```bash
# Everything at once: Next.js dev server + Firebase emulator suite
npm run dev:all
```

This runs [`next dev`](https://nextjs.org/docs/app/api-reference/cli/next#next-dev-options) and `firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data` concurrently. Ports:

| Service | Port |
| --- | --- |
| Next.js | 3000 |
| Emulator UI | 4000 |
| Auth | 9099 |
| Firestore | 8080 |
| Storage | 9199 |
| Functions | 5001 |
| Pub/Sub | 8085 |

Open:
- App: <http://localhost:3000>
- Dashboard: <http://localhost:3000/dashboard> (redirects to `/login` until authed)
- Emulator UI: <http://localhost:4000> — browse auth users, Firestore docs, Storage files

### Running pieces individually

```bash
npm run dev              # Next.js only
npm run dev:emulators    # emulators only (with persisted data at ./emulator-data)
```

## Emulator data persistence

The `dev:all` and `dev:emulators` scripts use `--import=./emulator-data --export-on-exit=./emulator-data`. That means:

- On start, state is loaded from `./emulator-data/`
- On clean exit (Ctrl-C), state is saved back
- The directory is gitignored

Manually snapshot:
```bash
npm run emulators:export   # writes current emulator state to ./emulator-data
npm run emulators:import   # starts emulators with that snapshot
```

Useful for capturing a known-good fixture state (signed-up user, seeded org, 5 leads) you can reload instantly.

## Common dev workflows

### Create a test user
1. Open <http://localhost:3000/signup>
2. Enter any email/password (the emulator accepts anything)
3. You'll land on `/onboarding`; name your workspace
4. Redirected to `/dashboard`

Verify in the Emulator UI:
- Auth tab → user appears
- Firestore → `users/{uid}` exists with `defaultOrgId`
- Firestore → `orgs/{orgId}` exists with your inputs
- Firestore → `orgs/{orgId}/memberships/{uid}` has `role: "owner"`
- Firestore → `orgs/{orgId}/usage/{yyyymm}` initialized

### Seed leads without AudienceLab

For now, you can create a lead directly in the Emulator UI:
1. Emulator UI → Firestore → navigate to `orgs/{orgId}/leads`
2. "Add document" → fields: `firstName`, `lastName`, `email`, `phone`, `source: "import"`, `status: "new"`, `createdAt: <server timestamp>`
3. `onLeadCreated` trigger fires in the Functions tab — adds `emailHash`, `phoneHash`, and increments usage.

A dev-only `/api/dev/seed` route will be added in Phase 2 for bulk fixture loading.

### Hitting API routes from the terminal

```bash
# Health check
curl http://localhost:3000/api/health

# Post a fake pixel event (once Phase 2 is wired up)
curl -X POST http://localhost:3000/api/webhook/pixel \
  -H 'Content-Type: application/json' \
  -d '{"pixelId":"pb-abc123","path":"/pricing","ip":"1.2.3.4"}'
```

## Connecting to real Firebase (when creds arrive)

1. Create Firebase projects: `pride-born-staging` (preview) and `pride-born-prod` (production).
2. In each project, enable Auth (Email/Password + Google), Firestore (Native mode), Storage.
3. Firebase Console → Project settings → Your apps → Web app → copy config.
4. Generate a service account: Project settings → Service accounts → Generate new private key.
5. Set Vercel env vars (see [`deployment.md`](./deployment.md)):
   - `NEXT_PUBLIC_FIREBASE_*` — from the web app config
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — `cat serviceAccount.json | base64 | tr -d '\n'`
   - `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=0` — turn off the emulator toggle in preview/prod
6. Update [`.firebaserc`](../.firebaserc) so `firebase use staging` / `firebase use production` work.
7. `firebase deploy --only firestore:rules,firestore:indexes,storage -P staging`
8. `firebase deploy --only functions -P staging`

## Common issues

| Symptom | Fix |
| --- | --- |
| `The default Firebase app does not exist` | You're importing `lib/firebase/admin` from a client component. Admin SDK is server-only; use `lib/firebase/client` instead. |
| `FIRESTORE UNAVAILABLE: The Firestore emulator is not running` | Start `npm run dev:emulators` in another tab before hitting server routes. |
| `Error (Firebase): ... API key not valid` | Placeholder keys trip Firebase's config check. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=1` so the SDK connects to the emulator regardless of key. |
| Emulator shuts down without exporting | `--export-on-exit` only fires on `SIGINT`. Ctrl-C (not `kill -9`) to trigger. |
| `Java: command not found` | Install Java 11+ (see prerequisites). |

## Scripts reference

From [`package.json`](../package.json):

```
npm run dev                 # Next.js dev server
npm run dev:emulators       # Firebase emulators with data persistence
npm run dev:all             # both concurrently
npm run build               # production Next.js build
npm run start               # production Next.js server
npm run lint                # ESLint
npm run emulators:export    # save current emulator state
npm run emulators:import    # boot emulators from saved state
npm run functions:deploy    # deploy Cloud Functions to active Firebase project
npm run rules:deploy        # deploy Firestore + Storage rules + indexes
```

## Where to look

- Environment variables: [`.env.example`](../.env.example)
- Next.js config: [`next.config.mjs`](../next.config.mjs)
- Firebase config: [`firebase.json`](../firebase.json), [`.firebaserc`](../.firebaserc)
- Security rules: [`firestore.rules`](../firestore.rules), [`storage.rules`](../storage.rules)
- Proxy (auth gate): [`proxy.js`](../proxy.js)
- Client SDK: [`lib/firebase/client.js`](../lib/firebase/client.js)
- Admin SDK: [`lib/firebase/admin.js`](../lib/firebase/admin.js)
- Cloud Functions: [`functions/src/`](../functions/src/)
