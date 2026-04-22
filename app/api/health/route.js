import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let firestore = "unknown";
  try {
    await adminDb.collection("_health").doc("ping").get();
    firestore = "up";
  } catch (err) {
    firestore = `down: ${err?.message || "error"}`;
  }
  return NextResponse.json({
    ok: firestore === "up",
    firestore,
    latencyMs: Date.now() - started,
    at: new Date().toISOString(),
  });
}
