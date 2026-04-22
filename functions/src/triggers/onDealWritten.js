import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db, FieldValue } from "../admin.js";

export const onDealWritten = onDocumentWritten(
  { document: "orgs/{orgId}/deals/{dealId}", region: "us-central1" },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    const { orgId, dealId } = event.params;

    // deletion — no activity
    if (!after) return;

    // creation
    if (!before) {
      await db.collection(`orgs/${orgId}/activities`).add({
        entityType: "deal",
        entityId: dealId,
        kind: "deal_created",
        actor: after.owner || "system",
        body: `Deal created in stage "${after.stage}"`,
        at: FieldValue.serverTimestamp(),
      });
      return;
    }

    // stage change
    if (before.stage !== after.stage) {
      await db.collection(`orgs/${orgId}/activities`).add({
        entityType: "deal",
        entityId: dealId,
        kind: "stage_change",
        actor: after.owner || "system",
        body: `Stage: ${before.stage} → ${after.stage}`,
        meta: { from: before.stage, to: after.stage },
        at: FieldValue.serverTimestamp(),
      });

      if (after.stage === "closed_won" && !after.closedAt) {
        await event.data.after.ref.set(
          { closedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
    }
  }
);
