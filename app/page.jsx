import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { C } from "./theme";

const INDUSTRIES = [
  { icon: "\u{1F3E0}", title: "Home Services", desc: "HVAC, plumbing, roofing, electrical, windows. Find homeowners by income, property type, and ZIP." },
  { icon: "\u2696\uFE0F", title: "PI Lawyers", desc: "Identify accident victims and injury prospects with verified contact data — before your competitors do." },
  { icon: "\u{1F489}", title: "Med Spas", desc: "Target high-income locals for Botox, filler, laser, and wellness. Skin in the game, literally." },
  { icon: "\u{1F6E1}\uFE0F", title: "Insurance", desc: "Auto, home, life, and health prospects with homeowner status, property value, and life-stage signals." },
  { icon: "\u{1F4CA}", title: "Agencies", desc: "White-label lead data and pixel tracking to deliver real pipeline for every client you run." },
];

const FEATURES = [
  {
    tag: "Audience Builder",
    title: "Draw a crowd from 250M+ records",
    desc: "Stack filters like income, homeowner status, property type, age, city, or ZIP. Watch the audience size estimate update in real time. No data scientists required.",
    bullets: ["250M+ consumer records", "Live size estimate", "Save and re-use audiences"],
    color: C.accent,
  },
  {
    tag: "Lead Data",
    title: "Names, phones, and emails you can actually use",
    desc: "Every lead comes with validated personal email, mobile phone, mailing address, and skiptrace match scoring. DNC flagged. CSV export in one click.",
    bullets: ["Validated personal + business email", "Skiptrace mobile & landline", "DNC compliance baked in"],
    color: C.green,
  },
  {
    tag: "Visitor Tracking",
    title: "Identify 30-40% of anonymous traffic",
    desc: "Drop our SuperPixel on your site and match real visitors to real people. Names, emails, and phone numbers for people who never filled out a form.",
    bullets: ["One-line install", "Dedupe across devices", "Webhook on every match"],
    color: C.purple,
  },
  {
    tag: "Campaigns",
    title: "Email + SMS outreach, no other tools needed",
    desc: "Compose once, send to segments of your leads. Built-in validation means fewer bounces and no DNC violations. Track opens, clicks, and replies.",
    bullets: ["Transactional-grade deliverability", "Inline validation status", "Opens, clicks, replies"],
    color: C.amber,
  },
  {
    tag: "Ads",
    title: "Push audiences straight to Meta + Google",
    desc: "SHA256-hashed emails and phones ready for Custom Audiences and Customer Match. Sync in a click, refresh automatically.",
    bullets: ["Meta Custom Audiences", "Google Customer Match", "Daily auto-refresh"],
    color: C.cyan,
  },
  {
    tag: "CRM Pipeline",
    title: "Track every lead from new to closed",
    desc: "A clean Kanban for your team: New → Contacted → Closed Won. Notes, activity, and touch tracking without the Salesforce bloat.",
    bullets: ["Drag & drop stages", "Lead notes and activity", "Revenue attribution"],
    color: C.red,
  },
];

const FLOW = [
  { n: "01", title: "Build your audience", desc: "Pick an industry and stack filters. Your estimate updates live." },
  { n: "02", title: "Pull leads or install the pixel", desc: "Get names, phones, emails — or identify who's already visiting your site." },
  { n: "03", title: "Launch a campaign", desc: "Email, SMS, or push to Meta + Google. All from one screen." },
  { n: "04", title: "Close in the CRM", desc: "Move leads through stages. Attribute revenue. Iterate." },
];

const STATS = [
  { value: "250M+", label: "U.S. consumer records" },
  { value: "30-40%", label: "Avg. anonymous visitor match rate" },
  { value: "<5 min", label: "From signup to first leads" },
  { value: "5+", label: "Industries supported day one" },
];

const FAQ = [
  {
    q: "Where does the lead data come from?",
    a: "We're built on top of AudienceLab's consumer graph — 250M+ U.S. records with validated contact info, skiptrace, demographics, and property data. Everything is CAN-SPAM, TCPA, and DNC-aware out of the box.",
  },
  {
    q: "How does the visitor tracking pixel work?",
    a: "Drop one line of JavaScript on your site. When a visitor lands, we match their browser fingerprint against our identity graph. About 30-40% of anonymous U.S. traffic gets matched to a real person — name, email, phone, address.",
  },
  {
    q: "Is this compliant?",
    a: "Yes. DNC status is flagged on every phone number. Email validation status is surfaced on every record. Pixel installation includes a consent banner snippet, and we never transmit personally identifiable information to ad platforms in the clear — everything goes out SHA256-hashed.",
  },
  {
    q: "Do you support my industry?",
    a: "We ship day-one packaging for home services, PI lawyers, med spas, insurance, and marketing agencies — but the audience builder is flexible enough for any B2C vertical. If you can describe your ideal customer with demographics or property attributes, we can find them.",
  },
  {
    q: "How long until I see leads?",
    a: "Under five minutes from sign-up. Build an audience, click Pull Leads, and they land in your table. Install the pixel and you're matching visitors that same day.",
  },
  {
    q: "What does pricing look like?",
    a: "Three tiers — Starter, Growth, and Scale — plus metered data usage for audiences beyond your monthly credit. See the full breakdown on the pricing page.",
  },
];

export default function Home() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav active="/" />

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              `radial-gradient(ellipse 800px 500px at 20% 10%, ${C.accentGlow}, transparent 60%),` +
              `radial-gradient(ellipse 700px 400px at 85% 30%, ${C.purpleSoft}, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "100px 24px 80px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              background: C.accentGlow,
              border: `1px solid ${C.accentBorder}`,
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              marginBottom: 28,
            }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
            Powered by AudienceLab · 250M+ records
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              margin: "0 0 24px",
              background: `linear-gradient(180deg, ${C.text} 0%, ${C.textSec} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Find leads. Contact them.
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${C.accent}, ${C.purple})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Close deals.
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: C.textSec,
              maxWidth: 640,
              margin: "0 auto 40px",
            }}
          >
            The all-in-one lead platform for local service businesses. Build audiences,
            identify site visitors, run email and SMS campaigns, and track deals in the CRM —
            without a stack of ten SaaS tools.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 56,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: C.accent,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 10px 40px rgba(45,127,249,0.35)",
              }}
            >
              Launch the dashboard →
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              See pricing
            </Link>
          </div>

          {/* Stat row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 1,
              background: C.border,
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              maxWidth: 880,
              margin: "0 auto",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  background: C.card,
                  padding: "22px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <SectionHeader
          eyebrow="Who it's for"
          title="Packaged for the industries that actually need leads"
          desc="Pre-built audience templates, compliance defaults, and outreach playbooks — tuned per vertical."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 40,
          }}
        >
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.title}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "22px 22px 26px",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{ind.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{ind.title}</h3>
              <p style={{ fontSize: 13.5, color: C.textSec, lineHeight: 1.55, margin: 0 }}>
                {ind.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <SectionHeader
          eyebrow="Features"
          title="One platform. Every step of the funnel."
          desc="From the first data pull to the closed-won ticket — nothing in between requires a separate login."
        />
        <div style={{ display: "grid", gap: 16, marginTop: 40 }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 32,
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: 32,
                alignItems: "center",
              }}
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: `${f.color}20`,
                    color: f.color,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 14,
                  }}
                >
                  {f.tag}
                </div>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    margin: "0 0 12px",
                    lineHeight: 1.15,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: C.textSec, fontSize: 14.5, lineHeight: 1.6, marginBottom: 18 }}>
                  {f.desc}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                  {f.bullets.map((b) => (
                    <li
                      key={b}
                      style={{
                        fontSize: 13.5,
                        color: C.text,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: `${f.color}25`,
                          color: f.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <FeatureVisual color={f.color} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* FLOW */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <SectionHeader
          eyebrow="How it works"
          title="From zero to first leads in under five minutes"
          desc="You don't need a data team. You don't need a lead-gen consultant. You need four clicks."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 40,
          }}
        >
          {FLOW.map((step) => (
            <div
              key={step.n}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "24px 22px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: "2px",
                  marginBottom: 12,
                }}
              >
                {step.n}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{step.title}</h3>
              <p style={{ fontSize: 13.5, color: C.textSec, lineHeight: 1.55, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <SectionHeader
          eyebrow="FAQ"
          title="The questions you'd ask us on a sales call"
        />
        <div style={{ display: "grid", gap: 12, marginTop: 40 }}>
          {FAQ.map((item) => (
            <details
              key={item.q}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "18px 22px",
              }}
            >
              <summary
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {item.q}
                <span style={{ color: C.textMut, fontSize: 18 }}>+</span>
              </summary>
              <p
                style={{
                  margin: "14px 0 0",
                  color: C.textSec,
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div
          style={{
            borderRadius: 20,
            padding: "56px 40px",
            textAlign: "center",
            background: `
              linear-gradient(135deg, ${C.card}, ${C.surface}),
              radial-gradient(circle at 30% 30%, ${C.accentGlow}, transparent 50%)
            `,
            border: `1px solid ${C.accentBorder}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 80% 50%, ${C.purpleSoft}, transparent 50%)`,
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-1px",
              margin: "0 0 16px",
              position: "relative",
            }}
          >
            Your first leads are waiting.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: C.textSec,
              maxWidth: 520,
              margin: "0 auto 28px",
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Start building audiences and running campaigns today. No credit card required
            for the free trial.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: C.accent,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Launch the dashboard
            </Link>
            <Link
              href="/pricing"
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
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
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 800,
          letterSpacing: "-1px",
          margin: "0 0 12px",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {desc && (
        <p
          style={{
            fontSize: 15,
            color: C.textSec,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

function FeatureVisual({ color, index }) {
  return (
    <div
      style={{
        aspectRatio: "16/11",
        borderRadius: 12,
        background: `
          radial-gradient(circle at 30% 30%, ${color}20, transparent 60%),
          linear-gradient(135deg, ${C.surfaceAlt}, ${C.surface})
        `,
        border: `1px solid ${C.border}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="80%" height="70%" viewBox="0 0 320 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fv-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={40 * i + 20}
            x2="320"
            y2={40 * i + 20}
            stroke={C.border}
            strokeWidth="1"
          />
        ))}
        <polygon
          points={(() => {
            const pts = Array.from({ length: 8 }, (_, i) => {
              const x = (i / 7) * 320;
              const y = 100 + Math.sin(i * 0.9 + index) * 30 - i * 4;
              return `${x},${y}`;
            }).join(" ");
            return `0,200 ${pts} 320,200`;
          })()}
          fill={`url(#fv-${index})`}
        />
        <polyline
          points={Array.from({ length: 8 }, (_, i) => {
            const x = (i / 7) * 320;
            const y = 100 + Math.sin(i * 0.9 + index) * 30 - i * 4;
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
        />
        {Array.from({ length: 8 }, (_, i) => {
          const x = (i / 7) * 320;
          const y = 100 + Math.sin(i * 0.9 + index) * 30 - i * 4;
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
        })}
      </svg>
    </div>
  );
}
