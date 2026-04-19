import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { C } from "../theme";

const TIERS = [
  {
    name: "Starter",
    price: "$99",
    cadence: "/mo",
    tagline: "For solo operators getting their first leads out the door.",
    highlight: false,
    features: [
      "Up to 2,500 lead credits/mo",
      "Audience builder (5 saved audiences)",
      "Website pixel (up to 25k visits/mo)",
      "Email campaigns (10k sends/mo)",
      "Basic CRM pipeline",
      "CSV export",
    ],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    price: "$299",
    cadence: "/mo",
    tagline: "For local businesses running real outbound.",
    highlight: true,
    features: [
      "Up to 15,000 lead credits/mo",
      "Unlimited saved audiences",
      "Pixel (up to 150k visits/mo)",
      "Email + SMS campaigns (50k sends)",
      "Meta + Google ad sync",
      "CRM with team seats (up to 5)",
      "Webhooks & API access",
    ],
    cta: "Start free trial",
  },
  {
    name: "Scale",
    price: "$799",
    cadence: "/mo",
    tagline: "For agencies and multi-location brands.",
    highlight: false,
    features: [
      "75,000 lead credits/mo",
      "Unlimited sub-accounts (white-label)",
      "Pixel (unlimited visits)",
      "Email + SMS (unlimited sends)",
      "Priority data refresh",
      "Dedicated success manager",
      "SSO + audit logs",
    ],
    cta: "Talk to sales",
  },
];

const ADDONS = [
  { name: "Extra lead credits", price: "$40 per 1,000", desc: "Metered usage beyond your plan's monthly credit." },
  { name: "Dedicated IP (email)", price: "$99/mo", desc: "For high-volume senders who want sender reputation in their own hands." },
  { name: "Dedicated short code (SMS)", price: "$499/mo", desc: "Premium carrier delivery and branded sender ID." },
  { name: "White-label branding", price: "$199/mo", desc: "Agency-facing domain, logo, and login UI." },
];

const COMPARE = [
  { feature: "Lead credits / mo", starter: "2,500", growth: "15,000", scale: "75,000" },
  { feature: "Saved audiences", starter: "5", growth: "Unlimited", scale: "Unlimited" },
  { feature: "Pixel visits / mo", starter: "25k", growth: "150k", scale: "Unlimited" },
  { feature: "Email sends / mo", starter: "10k", growth: "50k", scale: "Unlimited" },
  { feature: "SMS sends / mo", starter: "—", growth: "10k", scale: "Unlimited" },
  { feature: "Team seats", starter: "1", growth: "5", scale: "Unlimited" },
  { feature: "Meta + Google ad sync", starter: "—", growth: "✓", scale: "✓" },
  { feature: "Webhooks / API", starter: "—", growth: "✓", scale: "✓" },
  { feature: "SSO + audit logs", starter: "—", growth: "—", scale: "✓" },
  { feature: "Dedicated success manager", starter: "—", growth: "—", scale: "✓" },
];

export default function Pricing() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav active="/pricing" />

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
          Pricing
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            margin: "0 0 16px",
          }}
        >
          Honest pricing. No per-seat trap.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: C.textSec,
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Start free, then pick the tier that matches your volume. You only pay for extra
          data if you go past your monthly credit.
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {TIERS.map((t) => (
            <div
              key={t.name}
              style={{
                background: t.highlight
                  ? `linear-gradient(180deg, ${C.accentGlow}, ${C.card} 40%)`
                  : C.card,
                border: `1px solid ${t.highlight ? C.accentBorder : C.border}`,
                borderRadius: 16,
                padding: "32px 28px",
                position: "relative",
                boxShadow: t.highlight ? `0 0 0 1px ${C.accentBorder}, 0 20px 60px rgba(45,127,249,0.18)` : "none",
              }}
            >
              {t.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: C.accent,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Most popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textSec, marginBottom: 6 }}>
                {t.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px" }}>
                  {t.price}
                </span>
                <span style={{ fontSize: 14, color: C.textSec }}>{t.cadence}</span>
              </div>
              <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.55, margin: "0 0 22px" }}>
                {t.tagline}
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "11px 18px",
                  borderRadius: 10,
                  background: t.highlight ? C.accent : "transparent",
                  border: `1px solid ${t.highlight ? C.accent : C.border}`,
                  color: t.highlight ? "#fff" : C.text,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 22,
                }}
              >
                {t.cta}
              </Link>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {t.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 13,
                      color: C.text,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        color: t.highlight ? C.accent : C.green,
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          Compare plans
        </h2>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "16px 24px",
              borderBottom: `1px solid ${C.border}`,
              background: C.surfaceAlt,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: C.textMut,
            }}
          >
            <div>Feature</div>
            <div>Starter</div>
            <div>Growth</div>
            <div>Scale</div>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.feature}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "14px 24px",
                borderBottom: i === COMPARE.length - 1 ? "none" : `1px solid ${C.border}`,
                fontSize: 13.5,
                alignItems: "center",
              }}
            >
              <div style={{ color: C.text, fontWeight: 500 }}>{row.feature}</div>
              <div style={{ color: row.starter === "—" ? C.textMut : C.textSec }}>
                {row.starter}
              </div>
              <div style={{ color: row.growth === "—" ? C.textMut : C.textSec }}>
                {row.growth}
              </div>
              <div style={{ color: row.scale === "—" ? C.textMut : C.textSec }}>
                {row.scale}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADDONS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          Add-ons
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {ADDONS.map((a) => (
            <div
              key={a.name}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 22px",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 10 }}>
                {a.price}
              </div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
