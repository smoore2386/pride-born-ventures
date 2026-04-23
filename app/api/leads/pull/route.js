import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/firebase/session";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { buildLeadRecord } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AUDIENCELAB_API_URL || "https://app.audiencelab.io/api/v3";

async function resolveOrgId(uid) {
  const u = await adminDb.doc(`users/${uid}`).get();
  return u.exists ? u.data()?.defaultOrgId || null : null;
}

async function fetchFromAudienceLab({ audienceId, limit, apiKey }) {
  const res = await fetch(`${BASE}/audiences/${audienceId}/file?limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AudienceLab ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json().catch(() => ({}));
  // Expected shape: { records: [...] } or an array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function POST(req) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const orgId = await resolveOrgId(user.uid);
  if (!orgId) return NextResponse.json({ ok: false, error: "No default org" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { audienceId, limit = 50 } = body;
  if (!audienceId) return NextResponse.json({ ok: false, error: "Missing audienceId" }, { status: 400 });

  // Confirm the audience doc exists in this org
  const audienceRef = adminDb.doc(`orgs/${orgId}/audiences/${audienceId}`);
  const audienceSnap = await audienceRef.get();
  if (!audienceSnap.exists) {
    return NextResponse.json({ ok: false, error: "Audience not found" }, { status: 404 });
  }

  const apiKey = process.env.AUDIENCELAB_API_KEY;

  // Capacity check: reserve credits atomically before we burn the upstream call
  const orgRef = adminDb.doc(`orgs/${orgId}`);
  const reserved = await adminDb.runTransaction(async (tx) => {
    const org = await tx.get(orgRef);
    if (!org.exists) return 0;
    const total = org.data()?.leadCreditsTotal ?? 0;
    const used = org.data()?.leadCreditsUsed ?? 0;
    const available = Math.max(0, total - used);
    const take = Math.min(available, limit);
    if (take > 0) {
      tx.update(orgRef, { leadCreditsUsed: FieldValue.increment(take) });
    }
    return take;
  });

  if (reserved === 0) {
    return NextResponse.json(
      { ok: false, error: "Lead credit balance is 0. Upgrade your plan or wait for monthly reset." },
      { status: 402 }
    );
  }

  // Fetch records — live from AudienceLab if a key is set, otherwise bail.
  let rawRecords = [];
  if (apiKey) {
    try {
      rawRecords = await fetchFromAudienceLab({
        audienceId: audienceSnap.data()?.audienceLabAudienceId || audienceId,
        limit: reserved,
        apiKey,
      });
    } catch (err) {
      // Roll the credits back — the user shouldn't pay for an upstream failure
      await orgRef.update({ leadCreditsUsed: FieldValue.increment(-reserved) });
      return NextResponse.json(
        { ok: false, error: `AudienceLab fetch failed: ${err.message}. Credits refunded.` },
        { status: 502 }
      );
    }
  } else {
    // No AudienceLab key configured — roll back credits; instruct the user to use dev seed.
    await orgRef.update({ leadCreditsUsed: FieldValue.increment(-reserved) });
    return NextResponse.json(
      {
        ok: false,
        error: "AUDIENCELAB_API_KEY not set. Drop a key in Vercel env or use POST /api/dev/seed while developing.",
        hint: "dev-seed",
      },
      { status: 503 }
    );
  }

  // Batch-write leads (respecting Firestore 500-write cap).
  let written = 0;
  for (let i = 0; i < rawRecords.length; i += 400) {
    const batch = adminDb.batch();
    for (const raw of rawRecords.slice(i, i + 400)) {
      const ref = adminDb.collection(`orgs/${orgId}/leads`).doc();
      const record = buildLeadRecord(raw, { source: "audience", audienceId });
      batch.set(ref, {
        ...record,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      written++;
    }
    await batch.commit();
  }

  // If we over-reserved (fewer records returned than credits taken), refund the gap
  if (written < reserved) {
    await orgRef.update({ leadCreditsUsed: FieldValue.increment(written - reserved) });
  }

  // Usage counter
  const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
  await adminDb.doc(`orgs/${orgId}/usage/${yyyymm}`).set(
    { leadsImported: FieldValue.increment(written) },
    { merge: true }
  );

  // Mark the audience's last pull
  await audienceRef.set(
    { lastPulledAt: FieldValue.serverTimestamp(), actualSize: FieldValue.increment(written) },
    { merge: true }
  );

  return NextResponse.json({ ok: true, pulled: written, creditsUsed: written });
}
