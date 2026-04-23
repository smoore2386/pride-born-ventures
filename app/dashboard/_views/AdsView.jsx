"use client";

import { orderBy, limit } from "firebase/firestore";
import { C, mono } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection } from "../../../lib/hooks/useFirestore";
import { Empty } from "./ui";

export default function AdsView() {
  const { orgId } = useAuth();
  const { data: syncs, loading } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/adSyncs` : null,
    [orderBy("lastSyncedAt", "desc"), limit(20)]
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Ad Integration</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          Push SHA256-hashed audiences to Facebook and Google Ads
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        {[
          { name: "Facebook Ads", icon: "f", color: "#1877F2", field: "SHA256 Email + Phone" },
          { name: "Google Ads", icon: "G", color: "#4285F4", field: "SHA256 Email" },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: p.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 900, color: "#fff",
                }}
              >
                {p.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.name}</div>
                <div style={{ fontSize: 10, color: C.textMut }}>Connect in Phase 5</div>
                <div style={{ fontSize: 9.5, color: C.textMut, fontFamily: mono, marginTop: 2 }}>{p.field}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textMut }}>—</div>
              <div style={{ fontSize: 10, color: C.textMut }}>not connected</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && syncs.length === 0 ? (
        <Empty
          title="No ad syncs yet"
          body="Ad-platform sync ships in Phase 5. Your lead hashes (SHA256 of lowercased email + E.164 phone) are already computed — you'll push them to Meta Custom Audiences and Google Customer Match once OAuth is wired up."
        />
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Synced Audiences</div>
          {syncs.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.6fr 2fr",
                padding: "11px 0",
                borderBottom: i < syncs.length - 1 ? `1px solid ${C.border}` : "none",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{a.name || "(unnamed)"}</div>
              <div style={{ fontSize: 11, color: C.textSec }}>{a.destination}</div>
              <div style={{ fontSize: 11, color: C.textSec }}>{a.leadCount?.toLocaleString?.() || "—"}</div>
              <div style={{ fontSize: 11, color: a.status === "live" ? C.green : C.textMut }}>{a.status || "—"}</div>
              <div style={{ fontSize: 10, color: C.textMut, fontFamily: mono }}>{a.hashFields || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
