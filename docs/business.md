# Business plan

Internal working document. Updated as the business evolves.

## One-liner
Pride Born Ventures compresses lead data + website visitor identification + email/SMS outreach + ad audience sync + a CRM into one flat-rate subscription for local service businesses.

## Problem
Local operators (HVAC, roofing, PI lawyers, med spas, insurance agents) need predictable pipeline but lack growth teams. Current options:

- **Data brokers** (Apollo, ZoomInfo, LeadsLibrary) — opaque data provenance, no pixel, no outreach, no CRM. Customers stitch 4+ tools.
- **All-in-one CRMs** (HubSpot, GoHighLevel) — priced for mid-market, assume the customer already has inbound leads.
- **Agencies** — $3k–$15k/mo, opaque deliverables, long ramp.

**Our wedge:** one platform, one subscription, first lead in under 5 minutes.

## Target customer (ICP)

| Segment | TAM (US) | Target ACV | Priority |
| --- | --- | --- | --- |
| Home services operators (HVAC, roofing, plumbing) | ~1.1M businesses | $1.2k–$10k/yr | **P0** |
| PI lawyers (solo + small firms) | ~50k | $3.6k–$10k/yr | **P0** |
| Med spas | ~10k | $1.2k–$6k/yr | P1 |
| Independent insurance agents | ~400k | $1.2k–$10k/yr | P1 |
| Marketing agencies (white-label) | ~100k | $10k+/yr | P2 |

**Year 1 beachhead:** home services + PI lawyers on Growth ($299/mo) in Texas and Florida (highest density of our ICP + longest lead-gen buying habit).

## Buyer persona

- **Name:** Mike, 45, owner-operator of a 15-person HVAC shop
- **Pain:** buys leads from HomeAdvisor / Angi at $45/lead; quality is terrible. Also runs Facebook ads — can't tell if they work.
- **Goal:** fill next month's schedule without calling his marketing guy
- **Buying trigger:** slow week, a competitor's truck keeps showing up in his neighborhood, or seasonal prep (spring AC tune-ups, fall heating)
- **Decision speed:** talks to his wife, signs up the same day if the demo resonates
- **Price sensitivity:** strong — $299/mo is "worth it if it works"; $799/mo is "prove it first"

## Revenue model

### Subscription tiers
| Plan | Price | Lead credits/mo | Key features |
| --- | --- | --- | --- |
| Starter | $99/mo | 2,500 | Audiences, leads, pixel (25k visits), email (10k sends), basic CRM |
| **Growth** | **$299/mo** | **15,000** | + SMS, ad sync (Meta + Google), API, 5 seats |
| Scale | $799/mo | 75,000 | Unlimited seats, white-label, SSO, dedicated CSM |

### Expansion revenue
- **Metered overage:** $40 per 1,000 extra lead credits
- **Dedicated IP (email):** $99/mo
- **Dedicated shortcode (SMS):** $499/mo
- **White-label branding:** $199/mo

### Blended assumptions
- Average plan: Growth-heavy → $280 ACV blended
- Expansion attach rate: ~30% (mostly overage + white-label for agencies)
- Blended ARPU: ~$360/mo in steady state

## Unit economics

Target values at ~100-customer scale:

| Metric | Target |
| --- | --- |
| CAC (blended) | $400 |
| Gross margin | 70% |
| LTV (18-mo retention) | $5,400 |
| LTV:CAC | ~13:1 |
| Payback | 2–3 months |

Cost drivers per active customer:
- AudienceLab data — depends on negotiated wholesale rate; budget $20–$40/mo
- Postmark — $0.80 per 1,000 emails
- Twilio SMS — $0.0079 per SMS + A2P fees
- Firebase + Vercel — $2–$5/mo amortized
- Stripe fees — 2.9% + $0.30

## Go-to-market (first 90 days)

### Top-of-funnel
1. **Founder-led outbound.** 20 personalized demos/week, targeting HVAC + PI in TX/FL. Use our own audience builder to find prospects — dogfood.
2. **SEO cornerstone content.** 12 long-form posts (`"HVAC lead generation 2026"`, `"How to buy PI leads ethically"`, `"Med spa marketing playbook"`). Each tied to a preset audience template on signup.
3. **Free audience audit magnet.** "Paste your ZIP, see 10 homeowners matching your ICP." Converts pixel visitors into signups; also works as PR hook.
4. **Industry events.** Sponsor smallest booth at HVACR Expo, PILMMA, AmSpa Summit. Goal: 100 cards per event, 10% conversion to demo.

### Channel / partner
5. **Agency revenue share.** 5–10 small digital agencies serving local verticals. They resell; we handle data + infra; 20% rev share.
6. **Integration partners.** Direct integrations with 2–3 vertical CRMs (ServiceTitan for home services, MyCase for lawyers) so Pride Born lives alongside existing tooling.

### Conversion
- Trial: 14 days, no credit card. Unlock full Growth feature set; cap at 1,000 leads pulled.
- Onboarding: 15-min live setup call for every trial. Converts 3x better than self-serve alone.
- Pricing page anchors Growth as "most popular" — standard SaaS pattern, works.

## Competitive positioning

| Competitor | Where they win | Where we win |
| --- | --- | --- |
| Apollo / ZoomInfo | B2B data depth | B2C data; full outreach stack |
| HubSpot | Enterprise + inbound | Price, outbound-first, vertical playbooks |
| GoHighLevel | Agency white-label | Simpler, data included, compliance defaults |
| HomeAdvisor / Angi | Real-time inbound leads | 1/5th the per-lead cost, you own the contact |
| Facebook Ads direct | Reach + creative | Tracked conversion, hashed audience sync |

### Defensibility
1. **Vertical playbook depth** — compliance, templates, audience presets tuned per industry take months to replicate.
2. **AudienceLab data relationship** — exclusive tier + volume pricing as we scale.
3. **Network effects on the identity graph** — more pixel traffic → better match rates over time.

## Milestones

| Timing | Milestone | Cumulative $MRR |
| --- | --- | --- |
| M1 | MVP launch | $0 |
| M2 | 5 design partners | $1.5k |
| M3 | Public launch, 25 customers | $7k |
| M6 | 75 customers, A2P SMS approved, ad sync live | $22k |
| M9 | 150 customers, agency tier opens | $45k |
| M12 | 250 customers, first sales/support hire | $75k |
| M18 | 500 customers | $150k |
| M24 | 900 customers, $3M ARR run-rate | $270k |

## Risks + mitigations

| Risk | Mitigation |
| --- | --- |
| AudienceLab reliability / pricing | Build field-abstraction layer; can swap to Clay / Explorium / Versium without rewriting features |
| SMS A2P approval delays | Start registration in Phase 1; email-first launch if SMS slips |
| Email deliverability drops | Force domain auth (SPF/DKIM/DMARC) before first send; Postmark gives us leverage |
| Meta / Google ad API changes | Audience sync is expansion, not wedge; subscription survives platform churn |
| PI lawyer regulatory scrutiny | Compliance defaults + state bar guardrails; legal review before launching PI-specific playbook |
| Customer churn | Founder-led onboarding in first 100 customers; "close-the-loop" activity requires 1 lead pull + 1 campaign send in first 7 days |

## Fundraising posture

**Year 1:** bootstrap on founder capital + revenue. Keep burn under $5k/mo.
**Year 2:** if traction justifies (>$50k MRR with healthy retention), raise a $1.5–$2.5M seed. Use for: 2 engineers, 1 sales, expanded data partnerships.
**Avoid:** taking venture dollars before product-market fit is obvious. "Lead-gen SaaS" is a crowded category — valuation and leverage are both better after a few hundred paying customers.

## Key open questions

- **AudienceLab pricing tier** — we need a rev-share or wholesale arrangement before we can offer the Scale plan profitably.
- **First hire** — sales or engineer? Depends on whether growth is CAC-bound or feature-bound at M9.
- **Geographic expansion** — Canada is the obvious first international market; different data partner + light compliance work. Year 2.
- **Vertical #6** — moving/relocation? Real estate agents? Chiropractors? Decide at M6 based on inbound demand.

## Sources of truth

- Pricing — [`app/pricing/page.jsx`](../app/pricing/page.jsx) (rendered on site)
- Customer / usage metrics (post-launch) — PostHog dashboard + Firebase Firestore usage tab
- Revenue — Stripe dashboard
