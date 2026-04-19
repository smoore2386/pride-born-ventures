import Link from "next/link";
import { C } from "./theme";

export default function NotFound() {
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
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 90,
          fontWeight: 900,
          letterSpacing: "-3px",
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "18px 0 8px" }}>Page not found</h1>
      <p style={{ color: C.textSec, fontSize: 15, lineHeight: 1.6, maxWidth: 420 }}>
        We couldn't find the page you were looking for. It may have moved or been removed.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Link
          href="/"
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            background: C.accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.text,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
