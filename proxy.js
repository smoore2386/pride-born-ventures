import { NextResponse } from "next/server";

// Lightweight presence check on the session cookie. Full verification
// runs in route handlers (node runtime) — middleware stays Edge-safe.
export function proxy(req) {
  const session = req.cookies.get("__session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
  ],
};
