"use client";

import { orderBy } from "firebase/firestore";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { C } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection } from "../../../lib/hooks/useFirestore";
import { getClientDb } from "../../../lib/firebase/client";
import { Empty, Btn } from "./ui";

const STAGES = [
  { id: "new",        label: "New",        color: "#2D7FF9" },
  { id: "contacted",  label: "Contacted",  color: "#FFB020" },
  { id: "qualified",  label: "Qualified",  color: "#7C5CFC" },
  { id: "closed_won", label: "Closed Won", color: "#00C48C" },
];

export default function CRMView() {
  const { orgId } = useAuth();
  const { data: deals, loading } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/deals` : null,
    [orderBy("updatedAt", "desc")]
  );

  async function moveDeal(dealId, nextStage) {
    if (!orgId) return;
    const ref = doc(getClientDb(), `orgs/${orgId}/deals/${dealId}`);
    try {
      await updateDoc(ref, { stage: nextStage, updatedAt: serverTimestamp() });
    } catch (err) {
      alert("Could not move deal: " + err.message);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>CRM Pipeline</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          Drag-drop is disabled in this pass — click a card's stage buttons to advance it.
        </p>
      </div>

      {!loading && deals.length === 0 ? (
        <Empty
          title="No deals yet"
          body="Deals appear here automatically when you promote a lead. Run the dev seed to drop in sample cards."
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
        <div style={{ display: "flex", gap: 12 }}>
          {STAGES.map((s) => {
            const cards = deals.filter((d) => d.stage === s.id);
            return (
              <div key={s.id} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textMut, background: C.surfaceAlt, padding: "2px 7px", borderRadius: 5 }}>
                    {cards.length}
                  </span>
                </div>
                <div style={{ padding: 8, minHeight: 220 }}>
                  {cards.map((d) => {
                    const idx = STAGES.findIndex((x) => x.id === d.stage);
                    const prev = idx > 0 ? STAGES[idx - 1] : null;
                    const next = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
                    return (
                      <div
                        key={d.id}
                        style={{
                          background: C.surfaceAlt,
                          border: `1px solid ${C.border}`,
                          borderRadius: 9,
                          padding: 12,
                          marginBottom: 6,
                          transition: "border-color 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = s.color + "66")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                          {d.title || "(untitled deal)"}
                        </div>
                        {d.value != null && (
                          <div style={{ fontSize: 10.5, color: C.textMut }}>${Number(d.value).toLocaleString()}</div>
                        )}
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          {prev && (
                            <button
                              onClick={() => moveDeal(d.id, prev.id)}
                              style={{ flex: 1, padding: "4px 8px", borderRadius: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMut, fontSize: 10, cursor: "pointer" }}
                            >
                              ← {prev.label}
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => moveDeal(d.id, next.id)}
                              style={{ flex: 1, padding: "4px 8px", borderRadius: 6, background: next.color + "22", border: `1px solid ${next.color}44`, color: next.color, fontSize: 10, cursor: "pointer", fontWeight: 600 }}
                            >
                              {next.label} →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div style={{ padding: 8, textAlign: "center", borderRadius: 7, border: `1px dashed ${C.border}`, color: C.textMut, fontSize: 11 }}>
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
