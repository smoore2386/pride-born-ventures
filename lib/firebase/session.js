import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./admin";

export const SESSION_COOKIE = "__session";
export const SESSION_TTL_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_TTL_MS });
}

export async function getAuthedUser() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
