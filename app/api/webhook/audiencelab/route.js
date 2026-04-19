import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req) {
  const secret = process.env.AUDIENCELAB_WEBHOOK_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token && token === secret;
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const lead = {
    firstName: payload.FIRST_NAME,
    lastName: payload.LAST_NAME,
    email: payload.PERSONAL_EMAIL || payload.BUSINESS_EMAIL,
    emailValid: payload.PERSONAL_EMAIL_VALIDATION_STATUS,
    mobile: payload.SKIPTRACE_WIRELESS_NUMBERS,
    address: payload.SKIPTRACE_ADDRESS,
    city: payload.CITY,
    state: payload.STATE,
    zip: payload.ZIP,
    income: payload.INCOME,
    homeowner: payload.HOMEOWNER,
    age: payload.AGE,
    dnc: payload.DNC,
    receivedAt: new Date().toISOString(),
  };

  console.log("[audiencelab-webhook] lead received", lead);

  return NextResponse.json({ ok: true, received: { ...lead } });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "AudienceLab inbound webhook — POST JSON payloads here",
  });
}
