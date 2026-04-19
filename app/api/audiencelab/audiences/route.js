import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AUDIENCELAB_API_URL || "https://app.audiencelab.io/api/v3";

export async function GET(req) {
  const key = process.env.AUDIENCELAB_API_KEY;

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "AUDIENCELAB_API_KEY not set" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${BASE}/audiences`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, status: res.status, error: body || res.statusText },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Request failed" },
      { status: 500 }
    );
  }
}
