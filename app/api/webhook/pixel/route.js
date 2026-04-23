import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { buildLeadRecord, sha256 } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pixel webhook — receives visitor events from the AudienceLab SuperPixel
// or any compatible source. Payload shape (minimal):
//
//   { pixelId, orgId, path, userAgent, referrer, ip, match: { firstName, lastName, email, phone, city, state } }
//
// Auth: optional shared secret via `AUDIENCELAB_WEBHOOK_SECRET`. If unset,
// the endpoint accepts any payload (dev-friendly). Do not deploy unguarded to prod.

function isAuthorized(req) {
  const secret = process.env.AUDIENCELAB_WEBHOOK_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token && token === secret;
}

async function resolveOrgId(payload) {
  if (payload.orgId) return payload.orgId;
  // Fallback: look up by pixelId if orgs are keyed that way.
  if (payload.pixelId) {
    const snap = await adminDb
      .collection("orgs")
      .where("pixelId", "==", payload.pixelId)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0].id;
  }
  return null;
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const orgId = await resolveOrgId(payload);
  if (!orgId) {
    return NextResponse.json({ ok: false, error: "Cannot resolve orgId or pixelId" }, { status: 400 });
  }

  const match = payload.match || payload.identity || null;
  const now = FieldValue.serverTimestamp();
  const ipHash = payload.ip ? sha256(payload.ip) : null;

  // Upsert visitor by identity key (email hash if matched, otherwise ipHash+UA).
  const visitorKey = match?.email
    ? `email:${sha256(String(match.email).toLowerCase())}`
    : ipHash && payload.userAgent
      ? `ip:${ipHash}:${sha256(payload.userAgent)}`
      : null;

  const visitorsCol = adminDb.collection(`orgs/${orgId}/visitors`);
  const visitorRef = visitorKey ? visitorsCol.doc(visitorKey) : visitorsCol.doc();

  const visitorPatch = {
    pixelId: payload.pixelId || null,
    ipHash,
    userAgent: payload.userAgent || null,
    referrer: payload.referrer || null,
    landingPath: payload.path || null,
    sessionCount: FieldValue.increment(1),
    pages: FieldValue.increment(1),
    matched: !!match,
    matchedName: match ? [match.firstName, match.lastName].filter(Boolean).join(" ") : null,
    city: match?.city || null,
    state: match?.state || null,
    lastSeenAt: now,
  };

  await adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(visitorRef);
    if (!existing.exists) {
      tx.set(visitorRef, {
        ...visitorPatch,
        firstSeenAt: now,
        pages: 1,
        sessionCount: 1,
      });
    } else {
      tx.set(visitorRef, visitorPatch, { merge: true });
    }
  });

  // Optionally create a matched lead (idempotent by emailLower).
  let leadId = null;
  if (match && (match.email || match.phone)) {
    const leadRecord = buildLeadRecord(match, { source: "pixel", audienceId: null });
    const leadsCol = adminDb.collection(`orgs/${orgId}/leads`);
    let existing = null;
    if (leadRecord.emailLower) {
      const dup = await leadsCol.where("emailLower", "==", leadRecord.emailLower).limit(1).get();
      if (!dup.empty) existing = dup.docs[0];
    }
    if (existing) {
      leadId = existing.id;
    } else {
      const ref = leadsCol.doc();
      await ref.set({
        ...leadRecord,
        createdAt: now,
        updatedAt: now,
      });
      leadId = ref.id;
      // Usage increment
      const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
      await adminDb.doc(`orgs/${orgId}/usage/${yyyymm}`).set(
        { leadsImported: FieldValue.increment(1) },
        { merge: true }
      );
    }
    if (leadId) {
      await visitorRef.set({ matchedLeadId: leadId }, { merge: true });
    }
  }

  return NextResponse.json({ ok: true, visitorId: visitorRef.id, leadId });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Pride Born pixel webhook — POST visitor events here",
  });
}
