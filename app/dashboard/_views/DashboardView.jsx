"use client";

import { orderBy, limit } from "firebase/firestore";
import { C } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection, useFirestoreDoc } from "../../../lib/hooks/useFirestore";
import { Badge, Metric, Spark, StatusBadge } from "./ui";

export default function DashboardView({ connected }) {
  const { orgId } = useAuth();
  const { data: org } = useFirestoreDoc(orgId ? `orgs/${orgId}` : null);
  const { data: recentLeads } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/leads` : null,
    [orderBy("createdAt", "desc"), limit(5)]
  );
  const { data: allLeads } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/leads` : null,
    [orderBy("createdAt", "desc"), limit(500)]
  );
  const { data: deals } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/deals` : null,
    [orderBy("updatedAt", "desc"), limit(200)]
  );
  const { data: visitors } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/visitors` : null,
    [orderBy("lastSeenAt", "desc"), limit(500)]
  );

  const totalLeads = allLeads.length;
  const closedWon = deals.filter((d) => d.stage === "closed_won").length;
  const creditsUsed = org?.leadCreditsUsed ?? 0;
  const creditsTotal = org?.leadCreditsTotal ?? 0;
  const creditPct = creditsTotal ? Math.round((creditsUsed / creditsTotal) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          {connected ? "Live data from AudienceLab — all systems operational" : "Connect your AudienceLab API key in Settings to activate live data"}
        </p>
      </div>

      {!connected && (
        <div style={{ background: C.amberSoft, border: `1px solid ${C.amberBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>API not connected</div>
            <div style={{ fontSize: 12, color: C.textSec }}>
              Go to Settings → API Connection to add your AudienceLab key and start pulling live data.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Metric label="Total Leads" value={totalLeads.toLocaleString()} icon="👥" color={C.accent} />
        <Metric label="Deals in Pipeline" value={deals.length} icon="📤" color={C.purple} />
        <Metric label="Pixel Visitors" value={visitors.length} icon="👁️" color={C.amber} />
        <Metric label="Closed Won" value={closedWon} icon="🤝" color={C.green} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Lead Acquisition</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["7D", "30D", "90D"].map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 6,
                    background: p === "30D" ? C.accentGlow : "transparent",
                    color: p === "30D" ? C.accent : C.textMut,
                    cursor: "pointer", fontWeight: 600,
                    border: p === "30D" ? `1px solid ${C.accentBorder}` : "1px solid transparent",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <Spark data={[120, 180, 150, 220, 280, 240, 310, 290, 350, 380, 420, 460, 440, 510]} color={C.accent} h={110} />
          <div style={{ fontSize: 10, color: C.textMut, marginTop: 6 }}>
            Chart will reflect live daily rollups once campaigns begin (Phase 4).
          </div>
        </div>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Lead Credits</span>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: C.textSec }}>Used this month</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>
                {creditsUsed} / {creditsTotal}
              </span>
            </div>
            <div style={{ height: 6, background: C.surfaceAlt, borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${Math.min(creditPct, 100)}%`, background: creditPct > 80 ? C.amber : C.accent, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, color: C.textMut, marginTop: 10 }}>
              Plan: <span style={{ color: C.text, fontWeight: 600 }}>{org?.plan || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Recent Leads</span>
          <div style={{ marginTop: 12 }}>
            {recentLeads.length === 0 && (
              <div style={{ fontSize: 12, color: C.textMut, padding: "16px 0" }}>
                No leads yet — run a pull or seed sample data.
              </div>
            )}
            {recentLeads.map((l, i) => (
              <div
                key={l.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 0", borderBottom: i < recentLeads.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: [C.accentGlow, C.greenSoft, C.purpleSoft, C.amberSoft, C.redSoft][i % 5],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      color: [C.accent, C.green, C.purple, C.amber, C.red][i % 5],
                    }}
                  >
                    {(l.firstName?.[0] || "?") + (l.lastName?.[0] || "")}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>
                      {l.firstName} {l.lastName}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textMut }}>
                      {l.city}{l.state ? `, ${l.state}` : ""} {l.source === "pixel" ? "· 🔍 Pixel" : "· 📋 Audience"}
                    </div>
                  </div>
                </div>
                {l.status && <StatusBadge status={l.status} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Data Pipeline</span>
            <Badge color={connected ? C.green : C.amber} bg={connected ? C.greenSoft : C.amberSoft} border={connected ? C.greenBorder : C.amberBorder}>
              {connected ? "Live" : "Offline"}
            </Badge>
          </div>
          {[
            { label: "AudienceLab API", status: connected, detail: "V3 · List Audiences + Get File" },
            { label: "Firestore", status: true, detail: "Live org-scoped reads" },
            { label: "SuperPixel",     status: visitors.length > 0, detail: "V3 · White-labeled · Dedup active" },
            { label: "Facebook Sync", status: false, detail: "SHA256 email + phone hashing (Phase 5)" },
            { label: "Google Ads",     status: false, detail: "SHA256 email custom audiences (Phase 5)" },
          ].map((p, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{p.label}</div>
                <div style={{ fontSize: 10, color: C.textMut }}>{p.detail}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.status ? C.green : C.textMut }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
