// Phase-2 smoke test: signup -> session -> org -> dev seed -> list leads/visitors/deals
// -> pixel webhook -> CSV export -> test connection error paths.
//
// Runs against the emulator + local Next.js dev. No AudienceLab key required.

const PROJECT = "pride-born";
const AUTH_EMU = "http://127.0.0.1:9099";
const FS_EMU = "http://127.0.0.1:8080";
const NEXT = "http://localhost:3000";
const API_KEY = "demo-key";

const email = `phase2-${Date.now()}@prideborn.test`;
const password = "test-password-123";

function die(msg, extra) { console.error("FAIL:", msg, extra ?? ""); process.exit(1); }
function ok(msg)  { console.log("✅", msg); }

async function signUp() {
  const res = await fetch(
    `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true, displayName: "Phase2 Tester" }) }
  );
  if (!res.ok) die("signUp failed", await res.text());
  return res.json();
}

async function session(idToken) {
  const res = await fetch(`${NEXT}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) die("session failed", await res.text());
  return res.headers.get("set-cookie").split(";")[0];
}

async function api(cookie, path, init = {}) {
  const res = await fetch(`${NEXT}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}), cookie },
  });
  return { res, body: res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text() };
}

async function fs(path) {
  const res = await fetch(`${FS_EMU}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`, {
    headers: { Authorization: "Bearer owner" },
  });
  return res.ok ? res.json() : null;
}

async function fsCount(path) {
  const res = await fetch(`${FS_EMU}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`, {
    headers: { Authorization: "Bearer owner" },
  });
  if (!res.ok) return 0;
  const body = await res.json();
  return (body.documents || []).length;
}

async function run() {
  console.log("email:", email, "\n");

  // --- [1] signup + session
  const { idToken, localId } = await signUp();
  const cookie = await session(idToken);
  ok(`Signed up (${localId.slice(0,8)}…) + got session cookie`);

  // --- [2] create org
  const c1 = await api(cookie, "/api/orgs", { method: "POST", body: JSON.stringify({ name: "Phase2 Workspace", industry: "home" }) });
  if (!c1.res.ok) die("POST /api/orgs", c1.body);
  const orgId = c1.body.orgId;
  ok(`Org created: ${orgId}`);

  // --- [3] test connection — empty key
  const tc1 = await api(cookie, "/api/audiencelab/test", { method: "POST", body: JSON.stringify({}) });
  if (tc1.res.status !== 400) die("expected 400 for missing key", tc1);
  ok("POST /api/audiencelab/test with empty body → 400 Missing key");

  // --- [4] test connection — bogus key upstream (should fail gracefully, not 200)
  const tc2 = await api(cookie, "/api/audiencelab/test", { method: "POST", body: JSON.stringify({ apiKey: "bogus-key-not-real" }) });
  if (tc2.res.ok) die("bogus key unexpectedly succeeded", tc2.body);
  ok(`POST /api/audiencelab/test with bogus key → ${tc2.res.status} (rejected)`);

  // --- [5] dev seed
  const seed1 = await api(cookie, "/api/dev/seed", { method: "POST" });
  if (!seed1.res.ok) die("dev seed", seed1.body);
  if (seed1.body.seeded.leads !== 8) die(`seed wrong lead count: ${seed1.body.seeded.leads}`);
  ok(`Dev seed: ${JSON.stringify(seed1.body.seeded)}`);

  // verify collections via Firestore REST
  const leadCount = await fsCount(`orgs/${orgId}/leads`);
  const visitorCount = await fsCount(`orgs/${orgId}/visitors`);
  const dealCount = await fsCount(`orgs/${orgId}/deals`);
  const audCount = await fsCount(`orgs/${orgId}/audiences`);
  if (leadCount !== 8)   die(`leads count=${leadCount}, expected 8`);
  if (visitorCount !== 5) die(`visitors count=${visitorCount}, expected 5`);
  if (dealCount < 3)     die(`deals count=${dealCount}, expected >=3`);
  if (audCount !== 1)    die(`audiences count=${audCount}, expected 1`);
  ok(`Firestore has ${leadCount} leads, ${visitorCount} visitors, ${dealCount} deals, ${audCount} audiences`);

  // --- [6] pixel webhook
  const pixel = await api(cookie, "/api/webhook/pixel", {
    method: "POST",
    body: JSON.stringify({
      pixelId: "pb-seed",
      orgId,
      path: "/pricing",
      userAgent: "smoke-test",
      ip: "10.0.0.1",
      match: { firstName: "Taylor", lastName: "Pixel", email: "taylor.pixel@example.com", city: "Austin", state: "TX" },
    }),
  });
  if (!pixel.res.ok) die("pixel webhook", pixel.body);
  if (!pixel.body.leadId) die("pixel webhook did not create a lead", pixel.body);
  ok(`Pixel webhook: visitorId=${pixel.body.visitorId.slice(0,16)}… leadId=${pixel.body.leadId.slice(0,8)}…`);

  // Second pixel hit with same email should be idempotent (not create a 2nd lead)
  const pixel2 = await api(cookie, "/api/webhook/pixel", {
    method: "POST",
    body: JSON.stringify({
      pixelId: "pb-seed",
      orgId,
      path: "/contact",
      userAgent: "smoke-test",
      ip: "10.0.0.1",
      match: { firstName: "Taylor", lastName: "Pixel", email: "taylor.pixel@example.com", city: "Austin", state: "TX" },
    }),
  });
  if (pixel2.body.leadId !== pixel.body.leadId) die("pixel should be idempotent by email", pixel2.body);
  ok("Pixel webhook is idempotent on repeat email (no duplicate lead)");

  // --- [7] leads pull without AudienceLab key should 503
  const pull = await api(cookie, "/api/leads/pull", {
    method: "POST",
    body: JSON.stringify({ audienceId: "does-not-exist", limit: 10 }),
  });
  if (pull.res.status !== 404 && pull.res.status !== 503) die(`pull unexpected status ${pull.res.status}`, pull.body);
  ok(`POST /api/leads/pull without key → ${pull.res.status} ${pull.res.status === 404 ? "audience missing" : "no key"} (expected)`);

  // --- [8] CSV export
  const expRes = await fetch(`${NEXT}/api/leads/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({}),
  });
  if (!expRes.ok) die("export failed", await expRes.text());
  const ct = expRes.headers.get("content-type");
  const cd = expRes.headers.get("content-disposition");
  if (!ct.includes("text/csv")) die(`wrong content-type: ${ct}`);
  if (!cd?.includes("attachment")) die(`wrong content-disposition: ${cd}`);
  const csv = await expRes.text();
  const lines = csv.trim().split("\n");
  if (lines.length < 2) die(`CSV has only ${lines.length} lines`);
  if (!lines[0].startsWith("firstName,lastName,email")) die(`CSV header wrong: ${lines[0]}`);
  ok(`CSV export: ${lines.length - 1} rows, headers: ${lines[0].slice(0, 60)}…`);

  // --- [9] clear workspace (DELETE /api/dev/seed)
  const wipe = await api(cookie, "/api/dev/seed", { method: "DELETE" });
  if (!wipe.res.ok) die("dev-seed DELETE", wipe.body);
  ok(`Dev seed DELETE cleared ${wipe.body.deleted} docs`);
  const after = await fsCount(`orgs/${orgId}/leads`);
  if (after !== 0) die(`leads remain after wipe: ${after}`);
  ok("Workspace cleared");

  console.log("\n🎉 PHASE 2 SMOKE PASSED");
}

run().catch((e) => { console.error(e); process.exit(1); });
