import { getAuthedUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveOrgId(uid) {
  const u = await adminDb.doc(`users/${uid}`).get();
  return u.exists ? u.data()?.defaultOrgId || null : null;
}

const CSV_COLUMNS = [
  "firstName", "lastName", "email", "emailValid", "phone", "phoneE164",
  "address", "city", "state", "zip", "age", "gender", "income",
  "homeowner", "dnc", "status", "source", "createdAt",
];

function csvEscape(v) {
  if (v == null) return "";
  if (v?.toDate) v = v.toDate().toISOString();
  if (v instanceof Date) v = v.toISOString();
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function POST(req) {
  const user = await getAuthedUser();
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const orgId = await resolveOrgId(user.uid);
  if (!orgId) {
    return new Response(JSON.stringify({ ok: false, error: "No default org" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.leadIds) ? body.leadIds.slice(0, 5000) : null;

  // Fetch the selected leads (or up to 5000 most-recent if none provided)
  let docs = [];
  if (ids && ids.length) {
    // Chunk the get() — Admin SDK's getAll accepts up to ~500 refs at a time
    for (let i = 0; i < ids.length; i += 400) {
      const chunk = ids.slice(i, i + 400).map((id) => adminDb.doc(`orgs/${orgId}/leads/${id}`));
      const snaps = await adminDb.getAll(...chunk);
      for (const s of snaps) if (s.exists) docs.push({ id: s.id, ...s.data() });
    }
  } else {
    const snap = await adminDb.collection(`orgs/${orgId}/leads`).orderBy("createdAt", "desc").limit(5000).get();
    docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Stream the CSV directly. No Storage bucket required.
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(CSV_COLUMNS.join(",") + "\n"));
      for (const d of docs) {
        const row = CSV_COLUMNS.map((col) => csvEscape(d[col])).join(",");
        controller.enqueue(encoder.encode(row + "\n"));
      }
      controller.close();
    },
  });

  const filename = `pride-born-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
