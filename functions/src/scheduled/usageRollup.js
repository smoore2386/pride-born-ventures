import { onSchedule } from "firebase-functions/v2/scheduler";
import { db, FieldValue } from "../admin.js";

export const scheduledUsageRollup = onSchedule(
  { schedule: "every day 00:05", timeZone: "UTC", region: "us-central1" },
  async () => {
    const orgs = await db.collection("orgs").get();
    const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
    const batch = db.batch();

    orgs.forEach((doc) => {
      const ref = db.doc(`orgs/${doc.id}/usage/${yyyymm}`);
      batch.set(
        ref,
        { lastRolledAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    });

    await batch.commit();
  }
);
