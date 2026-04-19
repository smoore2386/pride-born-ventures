# Pride Born Ventures

All-in-one lead intelligence, outreach, and CRM platform for local service businesses. Build audiences, identify website visitors, run email + SMS campaigns, and close deals — powered by the AudienceLab consumer data graph.

## Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Inline style system, dark-first theme
- **Data partner**: [AudienceLab](https://audiencelab.io) V3 API + SuperPixel
- **Deploy target**: Vercel

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in AUDIENCELAB_API_KEY when you have it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing site. The interactive platform is at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing page (hero, features, flow, FAQ, CTA) |
| `/features` | Full capability breakdown across product surface |
| `/industries` | Vertical-specific playbooks (home services, PI, med spa, insurance, agency) |
| `/pricing` | Three-tier pricing, comparison table, add-ons |
| `/about` | Mission + values |
| `/dashboard` | Interactive platform MVP — 8 views |
| `/api/audiencelab/test` | `POST` — test AudienceLab API key / connectivity |
| `/api/audiencelab/audiences` | `GET` — proxy for AudienceLab list audiences |
| `/api/webhook/audiencelab` | `POST` — inbound webhook for AudienceLab / AudienceSync payloads |

## Dashboard views

1. **Dashboard** — KPIs, lead acquisition chart, industry mix, recent leads, pipeline status
2. **Audience Builder** — industry selection, filter stacks, live size estimate
3. **Lead Data** — tabular records with bulk actions, CSV export
4. **Visitor Tracking** — SuperPixel install, live visitor feed with match status
5. **Campaigns** — email + SMS composer with audience selection and delivery stats
6. **CRM Pipeline** — Kanban across New → Contacted → Closed Won
7. **Ad Integration** — Meta + Google Customer Match sync with SHA256 hash preview
8. **Settings** — API key, field mapping, webhooks, pixel snippet

## Environment variables

| Var | Purpose |
| --- | --- |
| `AUDIENCELAB_API_KEY` | Write-permission key from `app.audiencelab.io/account` → API Keys |
| `AUDIENCELAB_API_URL` | Defaults to `https://app.audiencelab.io/api/v3` |
| `AUDIENCELAB_WEBHOOK_SECRET` | Shared secret for inbound webhook authorization |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in metadata, sitemap, and pixel domain defaults |

## Deploying

```bash
npm run build         # local production build
vercel                # preview deploy
vercel --prod         # production deploy
```

Set the same env vars in the Vercel project settings (Production + Preview) before going live.

## Roadmap

- Authentication (Clerk or Descope via Vercel Marketplace)
- Postgres-backed lead + campaign persistence (Neon)
- Transactional email + SMS providers (Postmark, Twilio)
- AudienceSync CDP destination webhook handling
- Team seats, SSO, audit logs (Scale plan)
