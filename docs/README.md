# Pride Born Ventures — Documentation

All project documentation lives here. Start with [`architecture.md`](./architecture.md) for the system overview, then pick the doc that matches your task.

## Index

| Doc | Topic |
| --- | --- |
| [architecture.md](./architecture.md) | System architecture, tech boundary, request flow |
| [data-model.md](./data-model.md) | Firestore schema, indexes, data lifecycle |
| [security.md](./security.md) | Auth, session, security rules, PII, compliance |
| [development.md](./development.md) | Local dev with the Firebase emulator, scripts, workflows |
| [api.md](./api.md) | HTTP API reference (Next.js route handlers) |
| [deployment.md](./deployment.md) | Vercel + Firebase deployment runbook, env vars |
| [roadmap.md](./roadmap.md) | Phased execution plan (MVP → GA) |
| [business.md](./business.md) | Business plan: ICP, pricing, unit economics, GTM |
| [runbook.md](./runbook.md) | On-call / incident response runbook |

## Conventions

- **Code references** use file paths relative to the repo root, e.g. [app/api/auth/session/route.js](../app/api/auth/session/route.js).
- **Commands** are zsh/bash. `npm` is the package manager (pnpm is not installed on the dev machine).
- **Env vars** are defined in [`.env.example`](../.env.example). Never commit secrets.
- **Firebase emulator** is the default local backend. Real Firebase credentials arrive later; everything in `docs/` assumes emulator-first development.

## Quick links

- GitHub: <https://github.com/smoore2386/pride-born-ventures>
- Production: <https://pride-born-ventures.vercel.app>
- Emulator UI (when running locally): <http://localhost:4000>
