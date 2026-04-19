import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { C } from "../theme";

const CAPS = [
  {
    section: "Audience Builder",
    tagline: "Know exactly who you're targeting before you spend a dollar.",
    items: [
      "250M+ U.S. consumer records, refreshed weekly",
      "Location filters down to ZIP and radius",
      "Income, age, gender, household size, homeowner status",
      "Property attributes: type, value, year built, bedrooms",
      "Behavioral: movers, new parents, credit life events",
      "Live size estimate as you tune filters",
      "Save audiences; re-run on fresh data anytime",
    ],
  },
  {
    section: "Lead Data",
    tagline: "Every field you need to actually reach someone.",
    items: [
      "Personal and business email with validation status",
      "Mobile phone (skiptrace wireless + B2B wireless)",
      "Landline phones (consumer + B2B)",
      "Mailing address + city / state / ZIP",
      "DNC flag on every phone number",
      "Demographics: age, gender, income range",
      "CSV export, Google Sheets sync, API pull",
    ],
  },
  {
    section: "Visitor Tracking",
    tagline: "Turn anonymous traffic into named prospects.",
    items: [
      "One-line SuperPixel install",
      "30-40% match rate on U.S. visitors",
      "First / last / emails / phones resolved per match",
      "Dedupe across devices and sessions",
      "Webhook fires on every new match",
      "White-label tracking domain",
      "Consent banner snippet included",
    ],
  },
  {
    section: "Outreach",
    tagline: "Email and SMS campaigns — all from one screen.",
    items: [
      "Transactional-grade email deliverability",
      "SMS via carrier-compliant shortcodes",
      "Personalization merge fields from any AudienceLab property",
      "Segment-based sending with validation filters",
      "DNC-safe SMS gating",
      "Opens, clicks, replies, conversions",
      "A/B testing on subject and body",
    ],
  },
  {
    section: "Ads",
    tagline: "Push real identities to Meta and Google — hashed, ready, fresh.",
    items: [
      "SHA256-hashed email and phone fields",
      "Meta Custom Audiences sync",
      "Google Customer Match sync",
      "Daily auto-refresh on saved audiences",
      "LinkedIn Matched Audiences (coming Q3)",
      "Per-audience sync history and diffs",
    ],
  },
  {
    section: "CRM",
    tagline: "Pipeline without the Salesforce tax.",
    items: [
      "Kanban stages: New → Contacted → Qualified → Closed",
      "Notes, activity log, and touch history",
      "Team assignments and ownership",
      "Revenue attribution per lead source",
      "Pipeline value and conversion rate dashboards",
      "CSV + webhook sync to external CRMs",
    ],
  },
  {
    section: "Integrations",
    tagline: "Meet you where your stack already is.",
    items: [
      "AudienceLab (native data partner)",
      "Meta Ads Manager",
      "Google Ads",
      "Twilio, Postmark, SendGrid for delivery",
      "Zapier, Make, n8n for automation",
      "Webhooks in/out with signed payloads",
      "REST API with per-key scopes",
    ],
  },
];

export default function Features() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav active="/features" />

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: 14,
          }}
        >
          Features
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            margin: "0 0 16px",
          }}
        >
          The whole funnel, in one product.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: C.textSec,
            maxWidth: 620,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Audience → data → outreach → ads → CRM. Stop paying for five tools that don't
          talk to each other.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }}>
        <div style={{ display: "grid", gap: 18 }}>
          {CAPS.map((cap) => (
            <div
              key={cap.section}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "28px 30px",
                display: "grid",
                gridTemplateColumns: "1fr 1.3fr",
                gap: 28,
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    margin: "0 0 8px",
                  }}
                >
                  {cap.section}
                </h3>
                <p style={{ color: C.textSec, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {cap.tagline}
                </p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {cap.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      fontSize: 13.5,
                      color: C.text,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: C.accentGlow,
                        color: C.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 60px", textAlign: "center" }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            borderRadius: 10,
            background: C.accent,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 10px 40px rgba(45,127,249,0.3)",
          }}
        >
          See it all in the dashboard →
        </Link>
      </section>

      <Footer />
    </div>
  );
}
