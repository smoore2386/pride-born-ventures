import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookie, sessionCookieOptions, SESSION_COOKIE } from "@/lib/firebase/session";

export const runtime = "nodejs";

export async function POST(req) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
  }
  try {
    const sessionCookie = await createSessionCookie(idToken);
    const store = await cookies();
    store.set({ value: sessionCookie, ...sessionCookieOptions() });
    return NextResponse.json({ ok: true });
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
