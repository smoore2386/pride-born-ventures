import "server-only";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function resolveCredential() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (b64) {
    try {
      const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
      return cert(json);
    } catch (err) {
      console.warn("[admin] invalid FIREBASE_SERVICE_ACCOUNT_JSON, falling back to applicationDefault", err);
    }
  }
  try {
    return applicationDefault();
  } catch {
    return undefined;
  }
}

function initAdmin() {
  if (getApps().length) return;
  const credential = resolveCredential();
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "pride-born-dev";

  initializeApp({
    credential,
    projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

initAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();
export { FieldValue, Timestamp };
