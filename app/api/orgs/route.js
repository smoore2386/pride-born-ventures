import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/firebase/session";
import { adminDb, FieldValue } from "@/lib/firebase/admin";

export const runtime = "nodejs";

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

  const ref = adminDb.collection("orgs").doc();
  await ref.set({
    name,
    slug: slugify(name),
    industry,
    plan,
    ownerUserId: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, orgId: ref.id });
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
