import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { createHash } from "node:crypto";
import { db, FieldValue } from "../admin.js";

function sha256(v) {
  return createHash("sha256").update(v).digest("hex");
}

function normalizeEmail(e) {
  return (e || "").trim().toLowerCase();
}

function normalizePhone(p) {
  const digits = (p || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export const onLeadCreated = onDocumentCreated(
  { document: "orgs/{orgId}/leads/{leadId}", region: "us-central1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const lead = snap.data();
    const { orgId } = event.params;
    const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");

    const patch = { updatedAt: FieldValue.serverTimestamp() };
    const emailNorm = normalizeEmail(lead.email);
    const phoneE164 = normalizePhone(lead.phone || lead.phoneE164);

    if (emailNorm && !lead.emailLower) patch.emailLower = emailNorm;
    if (emailNorm && !lead.emailHash) patch.emailHash = sha256(emailNorm);
    if (phoneE164 && !lead.phoneE164) patch.phoneE164 = phoneE164;
    if (phoneE164 && !lead.phoneHash) patch.phoneHash = sha256(phoneE164);

    // DNC check against global cache
    if (phoneE164) {
      const dnc = await db.doc(`dncRegistry/${sha256(phoneE164)}`).get();
      if (dnc.exists) patch.dnc = true;
    }

    await snap.ref.set(patch, { merge: true });

    // usage + credit decrement — transactional
    const usageRef = db.doc(`orgs/${orgId}/usage/${yyyymm}`);
    const orgRef = db.doc(`orgs/${orgId}`);
    await db.runTransaction(async (tx) => {
      const org = await tx.get(orgRef);
      tx.set(
        usageRef,
        { leadsImported: FieldValue.increment(1) },
        { merge: true }
      );
      if (org.exists) {
        tx.update(orgRef, {
          leadCreditsUsed: FieldValue.increment(1),
        });
      }
    });
  }
);
