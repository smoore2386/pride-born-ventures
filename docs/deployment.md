# Deployment

Deployment split:
- **Frontend + route handlers:** Vercel (Next.js 16)
- **Backend services:** Firebase (Auth, Firestore, Cloud Functions, Storage)

Both are deployed independently. Neither directly depends on the other's deploy — but env vars must be kept in sync.

## Environments

| Environment | Vercel | Firebase alias | Firebase project |
| --- | --- | --- | --- |
| Local dev | `npm run dev:all` | `default` | `pride-born-dev` (emulator) |
| Preview | Vercel auto-preview on PR | `staging` | `pride-born-staging` |
| Production | Vercel production | `production` | `pride-born-prod` |

The Firebase aliases are defined in [`.firebaserc`](../.firebaserc). Switch between them with `firebase use staging` or `firebase use production`.

## First-time deploy checklist

### 1. Create Firebase projects

- **Staging:** Firebase Console → Add project → name `pride-born-staging`
- **Production:** name `pride-born-prod`

In each project, enable:
- Authentication → Sign-in method: Email/Password, Google
- Firestore → Create database → Production mode → location `us-central1`
- Storage → Get started → Production mode → `us-central1`
- Functions → Upgrade to Blaze plan (required for outbound requests + scheduled triggers; has a generous free tier)

### 2. Service accounts

For each project:
- Project settings → Service accounts → Generate new private key → download `serviceAccount.json`
- Encode: `cat serviceAccount.json | base64 | tr -d '\n' | pbcopy`
- Paste into Vercel env var `FIREBASE_SERVICE_ACCOUNT_JSON` scoped to the matching environment (Preview / Production)

### 3. Web app config

For each project:
- Project settings → Your apps → Add web app → name `pride-born-web`
- Copy the config values into Vercel env vars (Preview or Production scope):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=0` in Preview + Production.

### 4. Firestore rules + indexes

From your local checkout:
```bash
firebase use staging
firebase deploy --only firestore:rules,firestore:indexes,storage

firebase use production
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Cloud Functions

```bash
cd functions
npm install
cd ..

firebase use staging
firebase deploy --only functions

firebase use production
firebase deploy --only functions
```

Functions are Node 22, ESM (`"type": "module"` in [`functions/package.json`](../functions/package.json)).

### 6. Vercel env vars

Complete list — set each for Production + Preview, then optionally Development:

| Scope | Var | Source |
| --- | --- | --- |
| Public | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config |
| Public | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| Public | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config |
| Public | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web app config |
| Public | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config |
| Public | `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | `0` in preview/prod |
| Public | `NEXT_PUBLIC_SITE_URL` | `https://pride-born-ventures.vercel.app` (or custom domain) |
| Server | `FIREBASE_SERVICE_ACCOUNT_JSON` | base64 of service account JSON |
| Server | `AUDIENCELAB_API_KEY` | AudienceLab account → API Keys (write scope) |
| Server | `AUDIENCELAB_API_URL` | `https://app.audiencelab.io/api/v3` |
| Server | `AUDIENCELAB_WEBHOOK_SECRET` | random 32-byte string for inbound webhook auth |
| Server (Phase 3+) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | Stripe dashboard |
| Server (Phase 4+) | `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, `TWILIO_*` | Postmark + Twilio dashboards |
| Server (Phase 5+) | `META_APP_ID`, `META_APP_SECRET`, `GOOGLE_*` | Developer portals |
| Server (Phase 6+) | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_*` | Sentry + PostHog |

See [`.env.example`](../.env.example) for the authoritative list.

### 7. Deploy Next.js

```bash
# Preview
vercel

# Production
vercel --prod
```

Or push to `main` and let the Vercel GitHub integration deploy automatically.

## Ongoing deploys

### Frontend-only changes
```bash
git push                          # triggers Vercel preview on PR
# merge → Vercel auto-deploys production
```

### Firebase rules / indexes
```bash
firebase use production
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Cloud Functions
```bash
firebase use production
firebase deploy --only functions
# or just one function:
firebase deploy --only functions:onLeadCreated
```

### Atomic multi-service deploys
Firebase deploys are not atomic with Vercel deploys. If you change rules AND app code that relies on the rules:

1. Deploy the **looser** change first — either the backward-compatible code or the loosened rules.
2. Deploy the second change.

In practice: new fields → rules allow them first, then ship the code. New restrictive rules → ship the code that conforms first, then tighten rules.

## Rollback

### Vercel
Vercel dashboard → Deployments → pick previous deploy → "Promote to Production". Keeps the build artifact; no rebuild needed.

### Firebase rules / indexes
`firestore.rules` and `firestore.indexes.json` are versioned in git. Check out the prior commit and redeploy.

### Cloud Functions
Functions are versioned per deploy. `firebase functions:log` shows the deploy ID. To roll back:
```bash
git checkout <prior-sha> -- functions/
firebase deploy --only functions
```

## Monitoring deploys

- **Vercel:** dashboard → Deployments → pick a deploy → Logs / Runtime Logs
- **Firebase Functions:** Firebase Console → Functions → Logs, or `firebase functions:log`
- **Firestore:** Console → Firestore → Usage tab for read/write/storage metrics

## Custom domains

When `prideborn.io` is purchased:
1. Vercel project → Settings → Domains → add `prideborn.io` and `www.prideborn.io`
2. Update DNS per Vercel's instructions (A record for apex, CNAME for www)
3. Update `NEXT_PUBLIC_SITE_URL` env var to `https://prideborn.io` in Production scope
4. Firebase Auth → Authentication → Settings → Authorized domains → add the custom domain so OAuth redirects work
5. Redeploy

## Cost notes (MVP scale assumptions)

- **Vercel Pro** — $20/user/mo, generous function execution; upgrade when we exceed hobby limits (very soon after launch).
- **Firebase Blaze** — pay-as-you-go. At MVP scale (< 100 orgs, < 100k leads), expect $5–$25/mo across Firestore + Functions + Storage.
- **AudienceLab** — their pricing is the largest variable; metered into our subscription model.
- **Postmark + Twilio** — metered usage passed through to customers via overage credits.
- **Stripe** — 2.9% + $0.30 per charge.
