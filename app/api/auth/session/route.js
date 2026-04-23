import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookie, sessionCookieOptions, SESSION_COOKIE } from "@/lib/firebase/session";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(req) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);
    const store = await cookies();
    store.set({ value: sessionCookie, ...sessionCookieOptions() });

    // Inline onUserCreate: upsert /users/{uid}. createdAt only on first write.
    const userRef = adminDb.doc(`users/${decoded.uid}`);
    const existing = await userRef.get();
    const patch = {
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? null,
      lastLoginAt: FieldValue.serverTimestamp(),
    };
    if (!existing.exists) {
      patch.createdAt = FieldValue.serverTimestamp();
      patch.defaultOrgId = null;
    }
    await userRef.set(patch, { merge: true });

    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Invalid token" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
