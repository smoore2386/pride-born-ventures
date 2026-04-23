// End-to-end smoke test against the Firebase emulator + Next.js dev server.
// Simulates: create user -> sign in -> create session cookie -> create org
// -> verify Cloud Function triggers seeded user/org docs + membership + usage.

const PROJECT = process.env.SMOKE_PROJECT || "pride-born";
const AUTH_EMU = "http://127.0.0.1:9099";
const FS_EMU = "http://127.0.0.1:8080";
const NEXT = "http://localhost:3000";
const API_KEY = "demo-key";

const email = `e2e-${Date.now()}@prideborn.test`;
const password = "test-password-123";
const displayName = "E2E Test User";

function die(msg, extra) {
  console.error("FAIL:", msg, extra ?? "");
  process.exit(1);
}

async function signUp() {
  const res = await fetch(
    `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true, displayName }),
    }
  );
  if (!res.ok) die("signUp failed", await res.text());
  const body = await res.json();
  return body;
}

async function createSessionCookie(idToken) {
  const res = await fetch(`${NEXT}/api/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!res.ok) die("createSessionCookie failed", await res.text());
  const cookie = setCookie?.split(";")[0];
  if (!cookie) die("no __session cookie returned");
  return cookie;
}

async function createOrg(cookie) {
  const res = await fetch(`${NEXT}/api/orgs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ name: "Acme HVAC E2E", industry: "home", plan: "starter" }),
  });
  if (!res.ok) die("createOrg failed", await res.text());
  return res.json();
}

async function listOrgs(cookie) {
  const res = await fetch(`${NEXT}/api/orgs`, { headers: { cookie } });
  if (!res.ok) die("listOrgs failed", await res.text());
  return res.json();
}

async function fsGet(path) {
  const res = await fetch(
    `${FS_EMU}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`,
    { headers: { Authorization: "Bearer owner" } }
  );
  if (res.status === 404) return null;
  if (!res.ok) die(`fsGet ${path}`, await res.text());
  return res.json();
}

async function waitFor(label, fn, tries = 30) {
  for (let i = 0; i < tries; i++) {
    const r = await fn();
    if (r) return r;
    await new Promise((r) => setTimeout(r, 250));
  }
  die(`timed out waiting for: ${label}`);
}

function fields(doc) {
  const out = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    out[k] = v.stringValue ?? v.integerValue ?? v.booleanValue ?? v.timestampValue ?? v.nullValue ?? v;
  }
  return out;
}

async function deleteEmulatorUsers() {
  await fetch(
    `${AUTH_EMU}/emulator/v1/projects/${PROJECT}/accounts`,
    { method: "DELETE" }
  );
}

async function run() {
  console.log(`→ email: ${email}`);

  console.log("\n[1] Creating user in emulator auth");
  const { idToken, localId } = await signUp();
  console.log(`   uid=${localId}`);

  console.log("\n[2] POST /api/auth/session with idToken (also seeds users/{uid})");
  const cookie = await createSessionCookie(idToken);
  console.log(`   got cookie: ${cookie.slice(0, 40)}...`);

  console.log("\n[2b] Verifying /api/auth/session created users/{uid}");
  const userDoc = await waitFor("users/{uid}", async () => fsGet(`users/${localId}`));
  console.log("   users doc:", fields(userDoc));

  console.log("\n[4] GET /api/orgs (expect empty list)");
  const before = await listOrgs(cookie);
  console.log(`   orgs before: ${before.orgs.length}`);
  if (before.orgs.length !== 0) die("expected 0 orgs before creation");

  console.log("\n[5] POST /api/orgs to create workspace");
  const { orgId } = await createOrg(cookie);
  console.log(`   orgId=${orgId}`);

  console.log("\n[6] Waiting for onOrgCreated to seed membership + usage + credits");
  const membership = await waitFor(
    "membership",
    async () => fsGet(`orgs/${orgId}/memberships/${localId}`)
  );
  console.log("   membership:", fields(membership));
  if (fields(membership).role !== "owner") die("membership role !== owner");

  const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
  const usage = await waitFor(
    "usage doc",
    async () => fsGet(`orgs/${orgId}/usage/${yyyymm}`)
  );
  console.log("   usage:", fields(usage));

  const org = await waitFor(
    "org credits seeded",
    async () => {
      const o = await fsGet(`orgs/${orgId}`);
      if (!o) return null;
      return o.fields?.leadCreditsTotal?.integerValue === "2500" ? o : null;
    }
  );
  console.log("   org:", fields(org));
  if (fields(org).leadCreditsTotal !== "2500") die("leadCreditsTotal not seeded (expected 2500)");

  console.log("\n[7] Verify users/{uid}.defaultOrgId was set by onOrgCreated");
  const userAfter = await waitFor(
    "users.defaultOrgId",
    async () => {
      const u = await fsGet(`users/${localId}`);
      return u?.fields?.defaultOrgId?.stringValue === orgId ? u : null;
    }
  );
  console.log("   users.defaultOrgId:", fields(userAfter).defaultOrgId);

  console.log("\n[8] GET /api/orgs (expect 1 org with role=owner)");
  const after = await listOrgs(cookie);
  console.log(`   orgs after: ${after.orgs.length}`);
  if (after.orgs.length !== 1) die(`expected 1 org, got ${after.orgs.length}`);
  if (after.orgs[0].role !== "owner") die(`expected role=owner, got ${after.orgs[0].role}`);

  console.log("\n[9] DELETE /api/auth/session (logout)");
  const logoutRes = await fetch(`${NEXT}/api/auth/session`, { method: "DELETE", headers: { cookie } });
  if (!logoutRes.ok) die("logout failed", await logoutRes.text());
  const setCookie = logoutRes.headers.get("set-cookie") || "";
  console.log(`   set-cookie on logout: ${setCookie.slice(0, 80)}`);

  console.log("\n✅ ALL E2E CHECKS PASSED");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
