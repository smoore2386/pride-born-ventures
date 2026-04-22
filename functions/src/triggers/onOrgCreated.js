import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db, FieldValue } from "../admin.js";

const PLAN_DEFAULTS = {
  starter: { leadCreditsTotal: 2500 },
  growth: { leadCreditsTotal: 15000 },
  scale: { leadCreditsTotal: 75000 },
};

export const onOrgCreated = onDocumentCreated(
  { document: "orgs/{orgId}", region: "us-central1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const org = snap.data();
    const orgId = event.params.orgId;
    const ownerId = org.ownerUserId;
    if (!ownerId) return;

    const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
    const plan = org.plan || "starter";
    const credits = PLAN_DEFAULTS[plan]?.leadCreditsTotal ?? 0;

    const batch = db.batch();

    batch.set(
      db.doc(`orgs/${orgId}/memberships/${ownerId}`),
      {
        role: "owner",
        status: "active",
        joinedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`orgs/${orgId}/usage/${yyyymm}`),
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
      snap.ref,
      {
        leadCreditsTotal: credits,
        leadCreditsUsed: 0,
        leadCreditsResetAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      db.doc(`users/${ownerId}`),
      { defaultOrgId: orgId },
      { merge: true }
    );

    await batch.commit();
  }
);
