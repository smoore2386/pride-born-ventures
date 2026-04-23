"use client";

import { useState } from "react";
import { orderBy, limit } from "firebase/firestore";
import { C } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection } from "../../../lib/hooks/useFirestore";
import { Badge, StatusBadge, Btn, Empty } from "./ui";

export default function LeadsView() {
  const { orgId } = useAuth();
  const [sel, setSel] = useState([]);
  const { data: leads, loading } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/leads` : null,
    [orderBy("createdAt", "desc"), limit(200)]
  );

  const tog = (id) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const togAll = () => setSel(sel.length === leads.length ? [] : leads.map((l) => l.id));

  const exportCsv = async () => {
    const ids = sel.length ? sel : leads.map((l) => l.id);
    const res = await fetch("/api/leads/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadIds: ids }),
    });
    if (!res.ok) {
      alert("Export failed: " + (await res.text()));
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pride-born-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Lead Data</h2>
          <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${leads.length} records`} — verified contacts with skiptrace matching
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small onClick={exportCsv} disabled={!leads.length}>↓ Export CSV</Btn>
          <Btn small primary disabled={!sel.length}>+ Add to Campaign</Btn>
        </div>
      </div>

      {!loading && leads.length === 0 ? (
        <Empty
          title="No leads yet"
          body="Build an audience and pull leads from AudienceLab, or run the dev seed endpoint to drop 8 sample leads into your workspace."
          action={
            <Btn
              primary
              onClick={async () => {
                const r = await fetch("/api/dev/seed", { method: "POST" });
                const j = await r.json();
                if (!j.ok) alert(j.error || "Seed failed");
              }}
            >
              Seed sample data (dev)
            </Btn>
          }
        />
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1.3fr 1fr 0.8fr 0.7fr 0.6fr 60px 60px 80px", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
            <div onClick={togAll} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 15, height: 15, borderRadius: 4,
                  border: `2px solid ${sel.length === leads.length && leads.length ? C.accent : C.borderLight}`,
                  background: sel.length === leads.length && leads.length ? C.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff",
                }}
              >
                {sel.length === leads.length && leads.length ? "✓" : ""}
              </div>
            </div>
            {["Name", "Email", "Phone", "Location", "Income", "Owner", "DNC", "Valid", "Status"].map((h) => (
              <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {h}
              </div>
            ))}
          </div>
          {leads.map((l) => {
            const isSel = sel.includes(l.id);
            return (
              <div
                key={l.id}
                onClick={() => tog(l.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr 1.3fr 1fr 0.8fr 0.7fr 0.6fr 60px 60px 80px",
                  padding: "10px 16px",
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                  background: isSel ? C.accentGlow : "transparent",
                  transition: "background 0.08s",
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = C.surfaceAlt; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 15, height: 15, borderRadius: 4,
                      border: `2px solid ${isSel ? C.accent : C.borderLight}`,
                      background: isSel ? C.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff",
                    }}
                  >
                    {isSel ? "✓" : ""}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{l.firstName} {l.lastName}</div>
                <div style={{ fontSize: 11.5, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis" }}>{l.email}</div>
                <div style={{ fontSize: 11.5, color: C.textSec }}>{l.phone}</div>
                <div style={{ fontSize: 11.5, color: C.textSec }}>{l.city}{l.state ? `, ${l.state}` : ""}</div>
                <div style={{ fontSize: 11.5, color: C.textSec }}>{l.income || "—"}</div>
                <div style={{ fontSize: 11.5, color: l.homeowner ? C.green : C.textMut }}>{l.homeowner ? "✓" : "—"}</div>
                <div style={{ fontSize: 11.5, color: l.dnc ? C.red : C.textMut }}>{l.dnc ? "Y" : "N"}</div>
                <div>
                  {l.emailValid && (
                    <Badge
                      color={l.emailValid === "Valid" ? C.green : C.amber}
                      bg={l.emailValid === "Valid" ? C.greenSoft : C.amberSoft}
                      border={l.emailValid === "Valid" ? C.greenBorder : C.amberBorder}
                    >
                      {l.emailValid}
                    </Badge>
                  )}
                </div>
                <div>{l.status && <StatusBadge status={l.status} />}</div>
              </div>
            );
          })}
        </div>
      )}

      {sel.length > 0 && (
        <div
          style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: C.accent, color: "#fff", padding: "11px 22px", borderRadius: 12,
            fontSize: 12.5, fontWeight: 600, boxShadow: "0 8px 32px rgba(45,127,249,0.4)",
            display: "flex", gap: 14, alignItems: "center", zIndex: 50,
          }}
        >
          <span>{sel.length} selected</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={exportCsv}>Export</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Campaign</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>CRM</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Push to Ads</span>
        </div>
      )}
    </div>
  );
}
