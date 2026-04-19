import Link from "next/link";
import { C } from "../theme";

export default function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/industries", label: "Industries" },
        { href: "/dashboard", label: "Dashboard demo" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Docs" },
        { href: "/changelog", label: "Changelog" },
        { href: "/status", label: "Status" },
      ],
    },
  ];

  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
        marginTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 13,
                  color: "#fff",
                }}
              >
                PB
              </div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Pride Born Ventures</span>
            </div>
            <p style={{ color: C.textSec, fontSize: 13, lineHeight: 1.6, maxWidth: 340 }}>
              Find leads, contact them, and close deals — all in one place. Powered by
              AudienceLab data.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textMut,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 14,
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      style={{
                        color: C.textSec,
                        fontSize: 13,
                        transition: "color 0.15s",
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: C.textMut }}>
            © {new Date().getFullYear()} Pride Born Ventures. All rights reserved.
          </span>
          <span style={{ fontSize: 12, color: C.textMut }}>
            Built in Texas · Powered by AudienceLab
          </span>
        </div>
      </div>
    </footer>
  );
}
