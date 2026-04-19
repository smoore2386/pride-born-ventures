import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { C } from "../theme";

const VERTICALS = [
  {
    icon: "\u{1F3E0}",
    name: "Home Services",
    hook: "HVAC, plumbing, roofing, electrical, solar, windows.",
    body: "Homeowners with the right property profile convert up to 4x better than renters. We default your audience to verified homeowners, filter by home age and value, and sync to Meta and Google so you stop burning budget on window-shoppers.",
    play: [
      "Target by property age (roofers love 20+ yr homes)",
      "Filter by home value and income for premium services",
      "Pixel homeowners visiting your site — retarget with direct mail",
      "Drop SMS around storms and seasonal demand spikes",
    ],
  },
  {
    icon: "\u2696\uFE0F",
    name: "PI Lawyers",
    hook: "Personal injury, auto accidents, workplace injury.",
    body: "Accident victims shop attorneys fast — most sign within 72 hours of the incident. We help you reach them with compliant email and SMS within the window that matters, while honoring the legal and bar advertising rules in your state.",
    play: [
      "Behavioral signals for auto-accident intent",
      "Geo-radius targeting around hospitals and police stations",
      "Pixel identification of 'near me' search traffic",
      "Fully DNC-aware outreach with state bar compliance",
    ],
  },
  {
    icon: "\u{1F489}",
    name: "Med Spas",
    hook: "Botox, fillers, laser, coolsculpting, wellness.",
    body: "Med spa buyers cluster by income, age, and ZIP. We surface your ideal buyer (35-55, $85k+, homeowner, female-skewing) and let you retarget them across email, SMS, Meta, and Google — with tracking that attributes revenue back to the source.",
    play: [
      "High-income female target, 35-55, by ZIP",
      "Pixel identify website bookings that didn't complete",
      "SMS appointment reminders tied to the CRM",
      "Meta Custom Audiences for lookalike expansion",
    ],
  },
  {
    icon: "\u{1F6E1}\uFE0F",
    name: "Insurance",
    hook: "Auto, home, life, health, Medicare.",
    body: "Insurance is a life-stage game. We filter by triggers like homeowner status, mortgage age, new movers, and age-based Medicare eligibility so your outreach hits at the moment of need — not the moment of annoyance.",
    play: [
      "Medicare eligibility age filters",
      "New homeowner audiences for bundled policies",
      "Life-event triggers: marriage, baby, mortgage close",
      "TCPA-compliant SMS + validated email",
    ],
  },
  {
    icon: "\u{1F4CA}",
    name: "Marketing Agencies",
    hook: "Digital agencies, lead-gen shops, local media.",
    body: "Run Pride Born as white-label infrastructure for every client on your roster. Sub-accounts, custom domain, branded logins. You keep the relationship; we supply the pipe.",
    play: [
      "Sub-accounts per client with white-label domain",
      "Client-level billing and usage reporting",
      "Shared audience templates across your book",
      "Unlimited seats on Scale plan",
    ],
  },
];

export default function Industries() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav active="/industries" />

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
          Industries
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            margin: "0 0 16px",
          }}
        >
          Tuned for the verticals we know best.
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
          Pre-built audience templates, compliance defaults, and proven playbooks — per
          industry.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }}>
        <div style={{ display: "grid", gap: 18 }}>
          {VERTICALS.map((v) => (
            <div
              key={v.name}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "30px 32px",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.accentGlow}, ${C.purpleSoft})`,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {v.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    margin: "0 0 4px",
                  }}
                >
                  {v.name}
                </h3>
                <div style={{ color: C.accent, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  {v.hook}
                </div>
                <p style={{ color: C.textSec, fontSize: 14, lineHeight: 1.65, margin: "0 0 18px" }}>
                  {v.body}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 10,
                  }}
                >
                  {v.play.map((p) => (
                    <div
                      key={p}
                      style={{
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontSize: 12.5,
                        color: C.textSec,
                        lineHeight: 1.45,
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 60px", textAlign: "center" }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 12px",
          }}
        >
          Don't see your vertical?
        </h2>
        <p style={{ color: C.textSec, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
          The underlying data works for any B2C vertical. We just lead with the five where
          we have the deepest playbooks.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: 10,
            background: C.accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Build an audience →
        </Link>
      </section>

      <Footer />
    </div>
  );
}
