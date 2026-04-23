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

    const data = await res.json().catch(() => null);

    // Shape check: AudienceLab returns either a JSON array or an object with
    // an `audiences` array. If the response doesn't match either shape, treat
    // it as failure — even a 200 response can be the login HTML or an error
    // envelope when the key is invalid.
    const listed = Array.isArray(data)
      ? data
      : Array.isArray(data?.audiences)
        ? data.audiences
        : Array.isArray(data?.data)
          ? data.data
          : null;

    if (!listed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.error ||
            data?.message ||
            "AudienceLab returned an unrecognized response. Double-check the API key has 'write' scope and try again.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      audiencesFound: listed.length,
      msg: `Connected to AudienceLab — ${listed.length} audience${listed.length === 1 ? "" : "s"} found`,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Request failed" },
      { status: 500 }
    );
  }
}
