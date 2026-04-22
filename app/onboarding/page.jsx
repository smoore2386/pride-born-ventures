"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../../lib/hooks/useAuth";
import { C } from "../theme";

const INDUSTRIES = [
  { id: "home", label: "Home Services", desc: "HVAC, plumbing, roofing, electrical" },
  { id: "legal", label: "PI Lawyers", desc: "Personal injury, auto accidents" },
  { id: "medspa", label: "Med Spas", desc: "Botox, fillers, laser, wellness" },
  { id: "insurance", label: "Insurance", desc: "Auto, home, life, health" },
  { id: "agency", label: "Agency", desc: "Digital marketing, lead gen" },
  { id: "other", label: "Something else", desc: "Tell us more later" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userDoc, loading } = useAuth();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("home");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && userDoc?.defaultOrgId) router.replace("/dashboard");
  }, [loading, user, userDoc, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), industry }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create org");
      }
      router.push("/dashboard");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Let's set up your workspace"
      subtitle="Two quick details, then you're in."
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.textMut,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Company / workspace name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme HVAC"
            required
            style={{
              padding: "11px 14px",
              borderRadius: 9,
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </label>

        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.textMut,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: 8,
            }}
          >
            Primary industry
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {INDUSTRIES.map((ind) => {
              const active = industry === ind.id;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setIndustry(ind.id)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: active ? C.accentGlow : C.surfaceAlt,
                    border: `1px solid ${active ? C.accentBorder : C.border}`,
                    color: active ? C.accent : C.text,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{ind.label}</div>
                  <div style={{ fontSize: 10.5, color: C.textMut, marginTop: 2 }}>{ind.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{
            padding: "11px 18px",
            borderRadius: 10,
            background: C.accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting || !name.trim() ? 0.6 : 1,
            marginTop: 4,
          }}
        >
          {submitting ? "Creating workspace…" : "Create workspace"}
        </button>

        {err && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: C.redSoft,
              border: `1px solid rgba(255,77,79,0.25)`,
              color: C.red,
              fontSize: 12.5,
            }}
          >
            {err}
          </div>
        )}
      </form>
    </AuthShell>
  );
}
