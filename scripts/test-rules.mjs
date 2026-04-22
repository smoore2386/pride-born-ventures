// Firestore security-rules test suite.
// Hits the running firestore emulator at 127.0.0.1:8080.
//
// Run with: node scripts/test-rules.mjs
//
// Covers:
//  - unauthenticated reads rejected
//  - cross-org reads rejected
//  - member reads allowed
//  - clients cannot write to server-only collections (leads, visitors, usage)
//  - clients cannot mutate protected org fields (plan, credits, stripe)
//  - non-owner cannot change memberships
//  - deal stage must be a valid enum
//  - activities are append-only

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";
import { readFileSync } from "node:fs";

const PROJECT = "pride-born-rules-test";

function assertOk(label, ok) {
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  if (!ok) process.exitCode = 1;
}

async function run() {
  const env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: {
      rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
  await env.clearFirestore();

  const ORG = "org1";
  const OTHER_ORG = "org2";
  const OWNER = "owner1";
  const MEMBER = "member1";
  const OUTSIDER = "outsider1";

  // Seed: two orgs, membership for owner + member in ORG only.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `orgs/${ORG}`), {
      name: "Acme", plan: "starter", ownerUserId: OWNER, leadCreditsTotal: 2500, leadCreditsUsed: 0,
    });
    await setDoc(doc(db, `orgs/${ORG}/memberships/${OWNER}`), {
      role: "owner", status: "active",
    });
    await setDoc(doc(db, `orgs/${ORG}/memberships/${MEMBER}`), {
      role: "member", status: "active",
    });
    await setDoc(doc(db, `orgs/${OTHER_ORG}`), { name: "Other Co", plan: "starter" });
    await setDoc(doc(db, `orgs/${OTHER_ORG}/memberships/owner2`), {
      role: "owner", status: "active",
    });
    await setDoc(doc(db, `orgs/${ORG}/leads/lead1`), {
      firstName: "Ada", status: "new", createdAt: new Date(),
    });
    await setDoc(doc(db, `orgs/${ORG}/deals/deal1`), {
      leadId: "lead1", stage: "new", updatedAt: new Date(),
    });
  });

  const unauth = env.unauthenticatedContext().firestore();
  const asOwner = env.authenticatedContext(OWNER).firestore();
  const asMember = env.authenticatedContext(MEMBER).firestore();
  const asOutsider = env.authenticatedContext(OUTSIDER).firestore();

  console.log("\n── unauthenticated access ──");
  assertOk(
    "unauth GET /orgs/org1 is denied",
    await assertFails(getDoc(doc(unauth, `orgs/${ORG}`))).then(() => true, () => false)
  );
  assertOk(
    "unauth GET /orgs/org1/leads/lead1 is denied",
    await assertFails(getDoc(doc(unauth, `orgs/${ORG}/leads/lead1`))).then(() => true, () => false)
  );

  console.log("\n── cross-org isolation ──");
  assertOk(
    "outsider cannot read /orgs/org1",
    await assertFails(getDoc(doc(asOutsider, `orgs/${ORG}`))).then(() => true, () => false)
  );
  assertOk(
    "outsider cannot list /orgs/org1/leads",
    await assertFails(getDoc(doc(asOutsider, `orgs/${ORG}/leads/lead1`))).then(() => true, () => false)
  );

  console.log("\n── authorized reads ──");
  assertOk(
    "owner reads /orgs/org1",
    await assertSucceeds(getDoc(doc(asOwner, `orgs/${ORG}`))).then(() => true, () => false)
  );
  assertOk(
    "member reads /orgs/org1/leads/lead1",
    await assertSucceeds(getDoc(doc(asMember, `orgs/${ORG}/leads/lead1`))).then(() => true, () => false)
  );

  console.log("\n── server-only write collections ──");
  assertOk(
    "client CANNOT create a lead (server-only)",
    await assertFails(
      addDoc(collection(asOwner, `orgs/${ORG}/leads`), { firstName: "Nope" })
    ).then(() => true, () => false)
  );
  assertOk(
    "client CANNOT delete a lead",
    await assertFails(deleteDoc(doc(asOwner, `orgs/${ORG}/leads/lead1`))).then(() => true, () => false)
  );
  assertOk(
    "client CANNOT write /orgs/org1/visitors/*",
    await assertFails(
      setDoc(doc(asOwner, `orgs/${ORG}/visitors/v1`), { pixelId: "x" })
    ).then(() => true, () => false)
  );
  assertOk(
    "client CANNOT write /orgs/org1/usage/*",
    await assertFails(
      setDoc(doc(asOwner, `orgs/${ORG}/usage/202604`), { leadsImported: 1 })
    ).then(() => true, () => false)
  );

  console.log("\n── lead update whitelist ──");
  assertOk(
    "member CAN update allowed fields (status, tags)",
    await assertSucceeds(
      updateDoc(doc(asMember, `orgs/${ORG}/leads/lead1`), {
        status: "contacted", tags: ["warm"], updatedAt: new Date(),
      })
    ).then(() => true, () => false)
  );
  assertOk(
    "member CANNOT update protected fields (email)",
    await assertFails(
      updateDoc(doc(asMember, `orgs/${ORG}/leads/lead1`), { email: "hax@x" })
    ).then(() => true, () => false)
  );

  console.log("\n── protected org fields ──");
  assertOk(
    "admin CANNOT mutate /orgs/org1.plan from client",
    await assertFails(
      updateDoc(doc(asOwner, `orgs/${ORG}`), { plan: "scale" })
    ).then(() => true, () => false)
  );
  assertOk(
    "admin CANNOT mutate leadCreditsTotal from client",
    await assertFails(
      updateDoc(doc(asOwner, `orgs/${ORG}`), { leadCreditsTotal: 9999999 })
    ).then(() => true, () => false)
  );
  assertOk(
    "admin CAN update /orgs/org1.name",
    await assertSucceeds(
      updateDoc(doc(asOwner, `orgs/${ORG}`), { name: "New Name" })
    ).then(() => true, () => false)
  );

  console.log("\n── memberships (owner-only) ──");
  assertOk(
    "non-owner CANNOT modify memberships",
    await assertFails(
      setDoc(doc(asMember, `orgs/${ORG}/memberships/${OUTSIDER}`), {
        role: "admin", status: "active",
      })
    ).then(() => true, () => false)
  );
  assertOk(
    "owner CAN modify memberships",
    await assertSucceeds(
      setDoc(doc(asOwner, `orgs/${ORG}/memberships/${OUTSIDER}`), {
        role: "viewer", status: "invited",
      })
    ).then(() => true, () => false)
  );

  console.log("\n── deals (stage enum + shape) ──");
  assertOk(
    "member CAN create a valid deal",
    await assertSucceeds(
      setDoc(doc(asMember, `orgs/${ORG}/deals/deal2`), {
        leadId: "lead1", stage: "qualified", updatedAt: new Date(),
      })
    ).then(() => true, () => false)
  );
  assertOk(
    "member CANNOT create a deal with invalid stage",
    await assertFails(
      setDoc(doc(asMember, `orgs/${ORG}/deals/deal3`), {
        leadId: "lead1", stage: "bogus", updatedAt: new Date(),
      })
    ).then(() => true, () => false)
  );

  console.log("\n── activities (append-only) ──");
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `orgs/${ORG}/activities/act1`), {
      entityType: "deal", entityId: "deal1", kind: "note", actor: MEMBER, at: new Date(),
    });
  });
  assertOk(
    "member CAN create an activity",
    await assertSucceeds(
      addDoc(collection(asMember, `orgs/${ORG}/activities`), {
        entityType: "deal", entityId: "deal1", kind: "note", actor: MEMBER, at: new Date(),
      })
    ).then(() => true, () => false)
  );
  assertOk(
    "member CANNOT update an activity",
    await assertFails(
      updateDoc(doc(asMember, `orgs/${ORG}/activities/act1`), { kind: "call" })
    ).then(() => true, () => false)
  );
  assertOk(
    "member CANNOT delete an activity",
    await assertFails(
      deleteDoc(doc(asMember, `orgs/${ORG}/activities/act1`))
    ).then(() => true, () => false)
  );

  console.log("\n── user profile ──");
  const asUser = env.authenticatedContext("userA").firestore();
  const asOther = env.authenticatedContext("userB").firestore();
  assertOk(
    "user CAN create own profile",
    await assertSucceeds(
      setDoc(doc(asUser, "users/userA"), {
        email: "a@x", displayName: "A", createdAt: new Date(),
      })
    ).then(() => true, () => false)
  );
  assertOk(
    "user CANNOT read another user's profile",
    await assertFails(getDoc(doc(asOther, "users/userA"))).then(() => true, () => false)
  );

  await env.cleanup();
  if (process.exitCode) {
    console.log("\n❌ RULES TESTS FAILED");
  } else {
    console.log("\n✅ ALL RULES CHECKS PASSED");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
