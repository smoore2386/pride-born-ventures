"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { getClientDb } from "../firebase/client";

export function useFirestoreDoc(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const db = getClientDb();
    const unsub = onSnapshot(
      doc(db, path),
      (snap) => setState({ data: snap.exists() ? { id: snap.id, ...snap.data() } : null, loading: false, error: null }),
      (error) => setState({ data: null, loading: false, error })
    );
    return () => unsub();
  }, [path]);

  return state;
}

export function useFirestoreCollection(path, constraints = []) {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  const depsKey = JSON.stringify(constraints.map((c) => c?._type || c?.toString?.() || ""));

  useEffect(() => {
    if (!path) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    const db = getClientDb();
    const ref = constraints.length
      ? query(collection(db, path), ...constraints)
      : collection(db, path);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setState({ data, loading: false, error: null });
      },
      (error) => setState({ data: [], loading: false, error })
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, depsKey]);

  return state;
}
