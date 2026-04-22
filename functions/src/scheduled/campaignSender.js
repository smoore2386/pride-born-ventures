import { onSchedule } from "firebase-functions/v2/scheduler";
import { db, FieldValue } from "../admin.js";

export const scheduledCampaignSender = onSchedule(
  { schedule: "every 5 minutes", region: "us-central1" },
  async () => {
    const now = new Date();
    const due = await db
      .collectionGroup("campaigns")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .limit(20)
      .get();

    if (due.empty) return;

    for (const doc of due.docs) {
      // Mark as sending. Real delivery (Postmark/Twilio) ships in Phase 4.
      await doc.ref.set(
        {
          status: "sending",
          startedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
);
