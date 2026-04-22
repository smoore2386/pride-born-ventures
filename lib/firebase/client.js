"use client";

import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "1";

let connected = false;

function app() {
  return getApps().length ? getApp() : initializeApp(config);
}

function ensureEmulators() {
  if (!USE_EMULATOR || connected || typeof window === "undefined") return;
  try {
    connectAuthEmulator(getAuth(app()), "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(getFirestore(app()), "localhost", 8080);
    connectStorageEmulator(getStorage(app()), "localhost", 9199);
    connected = true;
  } catch {
    // Already connected — HMR re-import
    connected = true;
  }
}

export function getClientAuth() {
  const a = getAuth(app());
  ensureEmulators();
  return a;
}

export function getClientDb() {
  const d = getFirestore(app());
  ensureEmulators();
  return d;
}

export function getClientStorage() {
  const s = getStorage(app());
  ensureEmulators();
  return s;
}
