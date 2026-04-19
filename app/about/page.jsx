import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { C } from "../theme";

const VALUES = [
  {
    title: "Get the user to their first lead fast",
    body: "Every feature is measured against one question: does it get a new user a real lead in under five minutes? If it doesn't, it goes to the backlog.",
  },
  {
    title: "Compliance is not a feature — it's a default",
    body: "DNC, CAN-SPAM, TCPA, GDPR. The right defaults are on from day one. We refuse to ship a product that makes it easy to get sued.",
  },
  {
    title: "Simple beats clever",
    body: "Local business owners don't have time to learn another stack. We optimize for 'install, click, done' — not for configurability awards.",
  },
  {
    title: "Real data, transparent sources",
    body: "We're built on AudienceLab's consumer graph with explicit field-level provenance. No 'waved hands on sourcing' data — every record has a trail.",
  },
];

export default function About() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav active="/about" />

      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "80px 24px 20px",
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
          About
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            margin: "0 0 16px",
          }}
        >
          Leads shouldn't feel like a lottery.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: C.textSec,
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Pride Born Ventures is building the lead platform for local service businesses —
          the kind of operators who don't have a growth team but still need predictable
          pipeline every month.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 40px" }}>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "36px 36px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: 16,
            }}
          >
            Why we exist
          </div>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.7, margin: "0 0 14px" }}>
            Most lead-gen is opaque. You buy a list from a broker, you have no idea where
            the data came from, and you pray the phone numbers aren't disconnected. Or you
            run Meta ads for months and can't tell if it's working until your accountant
            closes the books.
          </p>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.7, margin: "0 0 14px" }}>
            We wanted something better — a platform where the data is known-good, the
            outreach is compliant by default, and the attribution actually makes sense.
            Something you could hand to a roofer or an insurance agent and have them
            running by Tuesday.
          </p>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            So we built Pride Born Ventures. Powered by AudienceLab's data, wrapped in a
            dashboard simple enough for non-technical operators, and priced so you can
            actually make money on the other side.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          What we optimize for
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {VALUES.map((v) => (
            <div
              key={v.title}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "24px 24px",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</div>
              <p style={{ color: C.textSec, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 80px", textAlign: "center" }}
      >
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
          See the dashboard →
        </Link>
      </section>

      <Footer />
    </div>
  );
}
