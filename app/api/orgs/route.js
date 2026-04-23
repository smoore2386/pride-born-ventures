import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/firebase/session";
import { adminDb, FieldValue } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// Kept in sync with functions/src/triggers/onOrgCreated.js — when Cloud Functions
// are deployed later the trigger does the same work; both are merge-idempotent.
const PLAN_CREDITS = {
  starter: 2500,
  growth: 15000,
  scale: 75000,
};

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(req) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name || "").trim();
  const industry = body.industry || "other";
  const plan = body.plan || "starter";

  if (!name) return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });

  const orgRef = adminDb.collection("orgs").doc();
  const orgId = orgRef.id;
  const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
  const credits = PLAN_CREDITS[plan] ?? 0;

  // Inline onOrgCreated: org + owner membership + usage doc + credits + users.defaultOrgId.
  const batch = adminDb.batch();

  batch.set(orgRef, {
    name,
    slug: slugify(name),
    industry,
    plan,
    ownerUserId: user.uid,
    leadCreditsTotal: credits,
    leadCreditsUsed: 0,
    leadCreditsResetAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });

  batch.set(
    adminDb.doc(`orgs/${orgId}/memberships/${user.uid}`),
    {
      role: "owner",
      status: "active",
      joinedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    adminDb.doc(`orgs/${orgId}/usage/${yyyymm}`),
    {
      leadsImported: 0,
      emailsSent: 0,
      smsSent: 0,
      adSyncs: 0,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  batch.set(
    adminDb.doc(`users/${user.uid}`),
    { defaultOrgId: orgId },
    { merge: true }
  );

  await batch.commit();

  return NextResponse.json({ ok: true, orgId });
}

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const memberships = await adminDb
    .collectionGroup("memberships")
    .where("status", "==", "active")
    .get();
  const mine = memberships.docs.filter((d) => d.id === user.uid);

  const orgs = await Promise.all(
    mine.map(async (m) => {
      const orgRef = m.ref.parent.parent;
      if (!orgRef) return null;
      const org = await orgRef.get();
      return org.exists ? { id: org.id, ...org.data(), role: m.data().role } : null;
    })
  );

  return NextResponse.json({ ok: true, orgs: orgs.filter(Boolean) });
}
