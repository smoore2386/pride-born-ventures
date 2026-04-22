"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getClientAuth, getClientDb } from "../../lib/firebase/client";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(
        fbUser
          ? {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
            }
          : null
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      return;
    }
    const db = getClientDb();
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setUserDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setUserDoc(null)
    );
    return () => unsub();
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // ignore — we still sign the user out of the client
    }
    await fbSignOut(getClientAuth());
  }, []);

  const value = {
    user,
    userDoc,
    orgId: userDoc?.defaultOrgId || null,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
