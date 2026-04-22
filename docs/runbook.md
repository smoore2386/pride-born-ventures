# Runbook

On-call / incident response playbook. Keep this practical — if a step doesn't fit on a phone screen, shorten it.

## Contacts

- Owner / on-call: Shane Moore (smoore2386@gmail.com)
- Vercel support: <https://vercel.com/help>
- Firebase support: <https://firebase.google.com/support>
- Stripe support: <https://support.stripe.com>
- AudienceLab support: TBD — add when the partnership is formalized

## Status page / observability

- **Vercel dashboard:** <https://vercel.com/shane-moores-projects-ef779c1f/pride-born-ventures>
- **Firebase console:** per project (staging + prod)
- **Sentry** (post-Phase 6): TBD
- **PostHog** (post-Phase 6): TBD
- **Uptime monitor** (post-Phase 6): BetterStack hitting [`/api/health`](../app/api/health/route.js) every 60s

## Severity definitions

| Sev | Definition | Response time |
| --- | --- | --- |
| SEV-1 | Full outage (site down, auth broken, dashboard blank for all users) | Immediate |
| SEV-2 | Major feature broken (lead pulls failing, campaigns not sending) | < 1 hour |
| SEV-3 | Minor feature broken (CSV export slow, one view janky) | < 1 business day |
| SEV-4 | Cosmetic / non-blocking | Backlog |

## First response (any severity)

1. **Look at `/api/health`** — quick confirm Firestore connectivity
2. **Vercel dashboard → Deployments → Runtime Logs** — errors in last 15 min
3. **Firebase console → Functions → Logs** — Cloud Function errors
4. **Recent deploys?** If last deploy was in last hour, consider rolling back before investigating
5. **External status** — check Firebase status (<https://status.firebase.google.com>), Vercel status (<https://www.vercel-status.com>), Stripe, Twilio, Postmark

## Common incidents

### "Users can't sign in"

Symptoms: `/login` submits, stays stuck, or lands on error.

Likely causes (ranked):
1. **Firebase Auth outage** — check Firebase status
2. **Expired session cookie signing key** — triggers 401 on `/api/auth/session`. Re-deploy with fresh `FIREBASE_SERVICE_ACCOUNT_JSON` if key rotated
3. **CORS / cookie domain mismatch** — only possible after a custom domain change; ensure `NEXT_PUBLIC_SITE_URL` matches the current origin

Fix:
- Test with a fresh incognito session + different email
- `curl -v https://pride-born-ventures.vercel.app/api/health` — confirm app reachable
- If 500 on `/api/auth/session`, check Vercel logs for the specific error

### "Lead pull failed"

Symptoms: `POST /api/leads/pull` returns 5xx or leads count doesn't match audience size.

Likely causes:
1. **AudienceLab API down or rate-limited** — retry after backoff; check their webhook if they notify partners
2. **Credit balance at 0** — check `orgs/{orgId}.leadCreditsUsed >= leadCreditsTotal`
3. **Firestore batch write exceeded limits** — batches are capped at 500 writes; large pulls should chunk

Fix:
- Inspect the specific error in route handler logs
- If credit-bound: nudge customer to upgrade or extend with metered overage
- If AudienceLab-side: retry with exponential backoff in API route (already built in to Phase 2 design)

### "Campaign stuck in 'sending'"

Symptoms: `campaigns/{id}.status = "sending"` for hours, no `sends/` subcollection growth.

Likely causes:
1. **Cloud Function crashed mid-fan-out** — logs will show the stack
2. **Postmark / Twilio credential invalidated** — provider 401 on every send
3. **Org lost DNS auth** — Postmark rejects sends

Fix:
- Cloud Functions → Logs for `scheduledCampaignSender` → find error
- If provider creds: rotate in Vercel env, redeploy functions with refreshed config
- If DNS: customer-facing banner; help them re-verify their domain
- Manually mark stuck campaigns back to `scheduled`; next tick picks them up

### "Pixel not firing / zero visitors"

Symptoms: `orgs/{orgId}/visitors` collection empty despite traffic.

Likely causes:
1. **Snippet not installed** or installed on wrong domain
2. **`AUDIENCELAB_WEBHOOK_SECRET` mismatch** between AudienceLab and our env
3. **Ad blockers** — expected loss; not all traffic is trackable

Fix:
- Walk customer through pulling DevTools → Network → filter `t.prideborn.io`
- Compare `AUDIENCELAB_WEBHOOK_SECRET` in Vercel env vs. value in AudienceLab console
- Expected match rate is 30–40% of unique U.S. visitors; below that warrants investigation

### "Stripe webhook delivery failing"

Symptoms: Stripe dashboard → Webhooks → pride-born-* → recent deliveries showing 4xx/5xx.

Likely causes:
1. **`STRIPE_WEBHOOK_SECRET` rotated on Stripe side but not updated in Vercel**
2. **Route handler crashed** — check Vercel logs
3. **Firebase Stripe Extension issue** — check Firebase Extensions dashboard

Fix:
- Stripe → Webhooks → pick endpoint → "Reveal secret" → compare with Vercel env
- Replay failed events after fix
- If Extension: reinstall or upgrade to latest version

### "Firestore read/write spike / cost alarm"

Likely causes:
1. **Runaway client listener** — a page mounts `onSnapshot(leads)` without a cleanup, or re-mounts on every keystroke
2. **Cross-org query bug** — rules should prevent it, but a `collectionGroup` with an uncapped `limit` could explode
3. **New customer doing a 100k-lead pull**

Fix:
- Firestore → Usage tab → which collection is hot
- Check recent deploys for new listeners; ensure all `useEffect` subscriptions return an unsubscribe
- Add query `limit()`s where missing
- If legitimate usage: this is a good problem; confirm billing is tracking

## Rotation playbooks

### Rotating `FIREBASE_SERVICE_ACCOUNT_JSON`

1. Firebase console → Project settings → Service accounts → Generate new private key
2. Encode: `cat new-sa.json | base64 | tr -d '\n'`
3. Vercel → project → Settings → Environment Variables → edit `FIREBASE_SERVICE_ACCOUNT_JSON` → paste → Save
4. Vercel → Deployments → Redeploy most recent production deploy
5. Verify `/api/health` returns `{ firestore: "up" }`
6. Firebase console → revoke the old service account key

### Rotating Stripe webhook secret

1. Stripe → Webhooks → edit endpoint → roll secret
2. Copy new signing secret
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel env
4. Redeploy
5. Stripe → failed events → replay

### Rotating AudienceLab key

1. AudienceLab → Account → API Keys → create new key (write scope)
2. Test new key: `curl -X POST https://pride-born-ventures.vercel.app/api/audiencelab/test -d '{"apiKey":"NEW"}'`
3. Update `AUDIENCELAB_API_KEY` in Vercel env
4. Redeploy
5. Revoke old key in AudienceLab

## Recovery

### Data restore

Firestore point-in-time recovery is available on the Blaze plan — Firebase console → Firestore → Backups. Retention up to 35 days.

For specific doc restoration:
1. Console → Firestore → navigate to the doc
2. "History" tab shows recent revisions (if PITR enabled)
3. Revert or copy fields manually

For a full restore:
1. Console → Backups → Schedule → "Restore"
2. Restore into a new database (not production) → verify → switch reads over

### Rolling back a deploy

**Vercel:** Deployments tab → pick prior working deploy → "Promote to Production"

**Cloud Functions:** `git checkout <prior-sha> -- functions && firebase deploy --only functions -P production`

**Rules:** `git checkout <prior-sha> -- firestore.rules && firebase deploy --only firestore:rules -P production`

## Post-incident

Every SEV-1 or SEV-2 incident gets a postmortem:
- **Summary** — what happened, impact, duration
- **Timeline** — minute-by-minute from detection to resolution
- **Root cause**
- **What went right / wrong**
- **Action items** — each with an owner and a date

Stored in `docs/postmortems/YYYY-MM-DD-short-slug.md` (directory created on first incident — hopefully never).
