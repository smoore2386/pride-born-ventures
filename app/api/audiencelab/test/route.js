import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.AUDIENCELAB_API_URL || "https://app.audiencelab.io/api/v3";

export async function POST(req) {
  const { apiKey } = await req.json().catch(() => ({}));
  const key = apiKey || process.env.AUDIENCELAB_API_KEY;

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Missing AudienceLab API key. Provide it in the request body or set AUDIENCELAB_API_KEY." },
      { status: 400 }
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
    const count = Array.isArray(data)
      ? data.length
      : Array.isArray(data?.audiences)
        ? data.audiences.length
        : null;

    return NextResponse.json({
      ok: true,
      audiencesFound: count,
      msg: count != null ? `Connected to AudienceLab — ${count} audiences found` : "Connected to AudienceLab",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Request failed" },
      { status: 500 }
    );
  }
}
