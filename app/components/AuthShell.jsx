import Link from "next/link";
import { C } from "../theme";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background:
            `radial-gradient(ellipse 700px 500px at 25% 20%, ${C.accentGlow}, transparent 60%),` +
            `radial-gradient(ellipse 700px 500px at 75% 80%, ${C.purpleSoft}, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 36,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 14,
            color: "#fff",
          }}
        >
          PB
        </div>
        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>
          Pride Born
        </span>
      </Link>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "32px 32px 28px",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.3px",
            margin: "0 0 6px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13.5, color: C.textSec, margin: "0 0 24px", lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {footer && (
        <div style={{ marginTop: 20, fontSize: 13, color: C.textSec, position: "relative" }}>
          {footer}
        </div>
      )}
    </div>
  );
}
