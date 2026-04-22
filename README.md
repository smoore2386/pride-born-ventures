# Pride Born Ventures

All-in-one lead intelligence, outreach, and CRM platform for local service businesses. Build audiences, identify website visitors, run email + SMS campaigns, and close deals — powered by the AudienceLab consumer data graph.

- **Production:** <https://pride-born-ventures.vercel.app>
- **Repo:** <https://github.com/smoore2386/pride-born-ventures>

## Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Backend:** Firebase — Auth, Firestore, Cloud Functions, Storage. Emulator-first for local dev.
- **Styling:** inline-style dark theme, Satoshi + IBM Plex Mono
- **Data partner:** [AudienceLab](https://audiencelab.io) V3 API + SuperPixel
- **Deploy target:** Vercel

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev:all
```

- App: <http://localhost:3000>
- Emulator UI: <http://localhost:4000>
- Dashboard: <http://localhost:3000/dashboard>

Firebase emulator handles everything locally — no real credentials needed. See [docs/development.md](./docs/development.md) for details.

## Documentation

All project documentation lives in [`/docs`](./docs).

| Doc | What's in it |
| --- | --- |
| [architecture.md](./docs/architecture.md) | System diagram, tech boundary, request flow, directory layout |
| [data-model.md](./docs/data-model.md) | Firestore collections, fields, indexes, lifecycle |
| [security.md](./docs/security.md) | Auth + session, rules, PII, compliance posture |
| [development.md](./docs/development.md) | Local dev with the emulator, scripts, workflows |
| [api.md](./docs/api.md) | HTTP API reference |
| [deployment.md](./docs/deployment.md) | Vercel + Firebase deployment runbook, env matrix |
| [roadmap.md](./docs/roadmap.md) | Phased execution (MVP → GA) |
| [business.md](./docs/business.md) | ICP, pricing, unit economics, GTM |
| [runbook.md](./docs/runbook.md) | On-call / incident response |

## Routes

### Public
| Path | Purpose |
| --- | --- |
| `/` | Marketing landing |
| `/features` | Capability breakdown |
| `/industries` | Vertical playbooks |
| `/pricing` | Tiers + comparison |
| `/about` | Mission + values |
| `/login`, `/signup` | Auth |
| `/onboarding` | First-org creation (authed) |

### Authenticated (dashboard — 8 views)
1. Dashboard KPIs
2. Audience Builder
3. Lead Data
4. Visitor Tracking
5. Campaigns (Email + SMS)
6. CRM Pipeline
7. Ad Integration
8. Settings

### API (Node runtime)
| Path | Method | Purpose |
| --- | --- | --- |
| `/api/auth/session` | POST, DELETE | Session cookie issuance / logout |
| `/api/orgs` | GET, POST | List + create orgs |
| `/api/health` | GET | Uptime probe (hits Firestore) |
| `/api/audiencelab/test` | POST | Validate AudienceLab key |
| `/api/audiencelab/audiences` | GET | List audiences |
| `/api/webhook/audiencelab` | POST | Inbound AudienceLab webhook |

See [docs/api.md](./docs/api.md) for the full reference, including roadmap routes.

## Scripts

```
npm run dev                 # Next.js only
npm run dev:emulators       # Firebase emulators
npm run dev:all             # both concurrently
npm run build               # production Next.js build
npm run start               # production Next.js server
npm run lint                # ESLint
npm run emulators:export    # snapshot current emulator state to ./emulator-data
npm run emulators:import    # boot emulators from saved state
npm run functions:deploy    # firebase deploy --only functions
npm run rules:deploy        # firebase deploy --only firestore:rules,firestore:indexes,storage
```

## License

Proprietary. All rights reserved.
