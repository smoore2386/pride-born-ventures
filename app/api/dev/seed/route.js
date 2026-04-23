import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/firebase/session";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { buildLeadRecord } from "@/lib/leads";

export const runtime = "nodejs";

// Dev-only. Refuses outside the Firebase emulator unless ALLOW_DEV_SEED=1.
function isDevAllowed() {
  if (process.env.FIRESTORE_EMULATOR_HOST) return true;
  if (process.env.ALLOW_DEV_SEED === "1") return true;
  return false;
}

const SAMPLE_LEADS = [
  { first: "Sarah",    last: "Mitchell", email: "s.mitchell@gmail.com",  emailStatus: "Valid",   phone: "(512) 555-0142", city: "Austin",      state: "TX", zip: "78701", income: "$85K-$100K",  homeowner: true,  age: 34, gender: "F", status: "new",       source: "audience" },
  { first: "James",    last: "Cooper",   email: "jcooper77@yahoo.com",   emailStatus: "Valid",   phone: "(512) 555-0298", city: "Round Rock",  state: "TX", zip: "78664", income: "$100K-$125K", homeowner: true,  age: 42, gender: "M", status: "new",       source: "pixel" },
  { first: "Maria",    last: "Gonzalez", email: "maria.g@outlook.com",   emailStatus: "Valid",   phone: "(737) 555-0183", city: "Cedar Park",  state: "TX", zip: "78613", income: "$75K-$85K",   homeowner: true,  age: 29, gender: "F", status: "contacted", source: "audience" },
  { first: "David",    last: "Kim",      email: "dkim.tx@gmail.com",     emailStatus: "Valid",   phone: "(512) 555-0371", city: "Georgetown",  state: "TX", zip: "78626", income: "$125K-$150K", homeowner: true,  age: 51, gender: "M", status: "contacted", source: "audience" },
  { first: "Ashley",   last: "Turner",   email: "a.turner@icloud.com",   emailStatus: "Risky",   phone: "(737) 555-0455", city: "Pflugerville",state: "TX", zip: "78660", income: "$60K-$75K",   homeowner: false, age: 26, gender: "F", status: "new",       source: "pixel" },
  { first: "Robert",   last: "Chen",     email: "rchen92@gmail.com",     emailStatus: "Valid",   phone: "(512) 555-0516", city: "Austin",      state: "TX", zip: "78731", income: "$150K+",      homeowner: true,  age: 45, gender: "M", status: "closed_won", source: "audience" },
  { first: "Jennifer", last: "Reyes",    email: "jreyes@gmail.com",      emailStatus: "Valid",   phone: "(512) 555-0627", city: "Lakeway",     state: "TX", zip: "78734", income: "$100K-$125K", homeowner: true,  age: 38, gender: "F", status: "new",       source: "audience" },
  { first: "Marcus",   last: "Johnson",  email: "mjohnson@hotmail.com",  emailStatus: "Unknown", phone: "(737) 555-0738", city: "Leander",     state: "TX", zip: "78641", income: "$85K-$100K",  homeowner: true,  age: 33, gender: "M", status: "contacted", source: "pixel" },
];

const SAMPLE_VISITORS = [
  { landingPath: "/pricing",        pages: 3, lastSeenMinsAgo: 2,  userAgent: "iPhone",  city: "Austin",      state: "TX", matchedName: "Sarah M." },
  { landingPath: "/services/hvac",  pages: 1, lastSeenMinsAgo: 8,  userAgent: "Desktop", city: "Round Rock",  state: "TX", matchedName: "James C." },
  { landingPath: "/contact",        pages: 2, lastSeenMinsAgo: 15, userAgent: "Android", city: "Cedar Park",  state: "TX", matchedName: null },
  { landingPath: "/pricing",        pages: 5, lastSeenMinsAgo: 22, userAgent: "Desktop", city: "Georgetown",  state: "TX", matchedName: "David K." },
  { landingPath: "/about",          pages: 1, lastSeenMinsAgo: 34, userAgent: "iPad",    city: "Austin",      state: "TX", matchedName: null },
];

export async function POST() {
  if (!isDevAllowed()) {
    return NextResponse.json(
      { ok: false, error: "Dev seed disabled. Runs only against the Firebase emulator or with ALLOW_DEV_SEED=1." },
      { status: 403 }
    );
  }
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const u = await adminDb.doc(`users/${user.uid}`).get();
  const orgId = u.exists && u.data()?.defaultOrgId;
  if (!orgId) {
    return NextResponse.json({ ok: false, error: "No defaultOrgId set on user. Complete /onboarding first." }, { status: 400 });
  }

  const audienceRef = adminDb.collection(`orgs/${orgId}/audiences`).doc();
  const batch = adminDb.batch();

  batch.set(audienceRef, {
    name: "Austin Homeowners $85K+ (seed)",
    industry: "home",
    filters: { state: "TX", income: ">=85k", homeowner: true },
    estimatedSize: 24650,
    actualSize: SAMPLE_LEADS.length,
    status: "ready",
    createdBy: user.uid,
    createdAt: FieldValue.serverTimestamp(),
    lastPulledAt: FieldValue.serverTimestamp(),
  });

  const leadIdsByFirstName = {};
  for (const raw of SAMPLE_LEADS) {
    const ref = adminDb.collection(`orgs/${orgId}/leads`).doc();
    leadIdsByFirstName[raw.first] = ref.id;
    const record = buildLeadRecord(raw, {
      source: raw.source === "pixel" ? "pixel" : "audience",
      audienceId: audienceRef.id,
    });
    batch.set(ref, {
      ...record,
      status: raw.status === "closed_won" ? "closed" : raw.status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  for (const v of SAMPLE_VISITORS) {
    const ref = adminDb.collection(`orgs/${orgId}/visitors`).doc();
    const lastSeen = new Date(Date.now() - v.lastSeenMinsAgo * 60_000);
    batch.set(ref, {
      pixelId: "pb-seed",
      userAgent: v.userAgent,
      landingPath: v.landingPath,
      pages: v.pages,
      city: v.city,
      state: v.state,
      matched: !!v.matchedName,
      matchedName: v.matchedName,
      firstSeenAt: lastSeen,
      lastSeenAt: lastSeen,
      sessionCount: 1,
    });
  }

  // Seed one deal per contacted/closed lead so the CRM Kanban has cards
  for (const raw of SAMPLE_LEADS.filter((l) => l.status === "contacted" || l.status === "closed_won")) {
    const dealRef = adminDb.collection(`orgs/${orgId}/deals`).doc();
    batch.set(dealRef, {
      leadId: leadIdsByFirstName[raw.first],
      title: `${raw.first} ${raw.last}`,
      value: 5000,
      owner: user.uid,
      stage: raw.status === "closed_won" ? "closed_won" : "contacted",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  return NextResponse.json({
    ok: true,
    seeded: {
      audienceId: audienceRef.id,
      leads: SAMPLE_LEADS.length,
      visitors: SAMPLE_VISITORS.length,
      deals: SAMPLE_LEADS.filter((l) => l.status === "contacted" || l.status === "closed_won").length,
    },
  });
}

export async function DELETE() {
  if (!isDevAllowed()) {
    return NextResponse.json(
      { ok: false, error: "Dev seed disabled." },
      { status: 403 }
    );
  }
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const u = await adminDb.doc(`users/${user.uid}`).get();
  const orgId = u.exists && u.data()?.defaultOrgId;
  if (!orgId) return NextResponse.json({ ok: false, error: "No default org" }, { status: 400 });

  const cols = ["audiences", "leads", "visitors", "deals", "activities"];
  let total = 0;
  for (const col of cols) {
    const snap = await adminDb.collection(`orgs/${orgId}/${col}`).get();
    const batches = [];
    let batch = adminDb.batch();
    let count = 0;
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      count++;
      total++;
      if (count === 400) { batches.push(batch.commit()); batch = adminDb.batch(); count = 0; }
    }
    if (count > 0) batches.push(batch.commit());
    await Promise.all(batches);
  }
  return NextResponse.json({ ok: true, deleted: total });
}
