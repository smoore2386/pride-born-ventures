import "server-only";
import { createHash } from "node:crypto";

export function sha256(v) {
  return createHash("sha256").update(String(v)).digest("hex");
}

export function normalizeEmail(e) {
  return (e || "").trim().toLowerCase();
}

export function normalizePhone(p) {
  const digits = (p || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Produce a hashed + normalized lead record ready to store in Firestore.
 * Matches the shape expected by /orgs/{orgId}/leads and downstream consumers.
 *
 * Note: callers are responsible for supplying `createdAt` / `updatedAt` via
 * `FieldValue.serverTimestamp()` when writing — this lib is pure and doesn't
 * import firebase-admin directly.
 */
export function buildLeadRecord(raw, { source = "import", audienceId = null } = {}) {
  const email = raw.email ?? raw.PERSONAL_EMAIL ?? raw.BUSINESS_EMAIL ?? null;
  const phone = raw.phone ?? raw.SKIPTRACE_WIRELESS_NUMBERS ?? raw.phoneE164 ?? null;
  const emailLower = email ? normalizeEmail(email) : null;
  const phoneE164 = phone ? normalizePhone(phone) : null;

  return {
    source,
    audienceId,
    firstName: raw.firstName ?? raw.FIRST_NAME ?? raw.first ?? null,
    lastName: raw.lastName ?? raw.LAST_NAME ?? raw.last ?? null,
    email,
    emailLower,
    emailHash: emailLower ? sha256(emailLower) : null,
    emailValid:
      raw.emailValid ??
      raw.PERSONAL_EMAIL_VALIDATION_STATUS ??
      raw.emailStatus ??
      null,
    phone,
    phoneE164,
    phoneHash: phoneE164 ? sha256(phoneE164) : null,
    address: raw.address ?? raw.SKIPTRACE_ADDRESS ?? null,
    city: raw.city ?? raw.CITY ?? null,
    state: raw.state ?? raw.STATE ?? null,
    zip: raw.zip ?? raw.ZIP ?? null,
    age: raw.age ?? raw.AGE ?? null,
    gender: raw.gender ?? raw.GENDER ?? null,
    income: raw.income ?? raw.INCOME ?? null,
    homeowner: raw.homeowner ?? raw.HOMEOWNER ?? null,
    dnc:
      raw.dnc === true ||
      raw.DNC === "Y" ||
      raw.DNC === true ||
      false,
    status: raw.status ?? "new",
    tags: raw.tags ?? [],
  };
}

const PLAN_CREDITS = { starter: 2500, growth: 15000, scale: 75000 };
export function planLeadCredits(plan) {
  return PLAN_CREDITS[plan] ?? 0;
}
