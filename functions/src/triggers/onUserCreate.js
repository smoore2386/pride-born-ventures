import { auth as authTrigger } from "firebase-functions/v1";
import { db, FieldValue } from "../admin.js";

export const onUserCreate = authTrigger.user().onCreate(async (user) => {
  const ref = db.collection("users").doc(user.uid);
  await ref.set(
    {
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
      defaultOrgId: null,
    },
    { merge: true }
  );
});
