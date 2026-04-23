"use client";

import { C } from "../../theme";
import { NAV } from "./data";

export default function Sidebar({ active, setActive, collapsed }) {
  return (
    <div style={{ width: collapsed ? 62 : 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ padding: collapsed ? "22px 0" : "22px 20px", textAlign: collapsed ? "center" : "left", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: collapsed ? 16 : 15, fontWeight: 900, color: C.text, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
          {collapsed ? "PB" : "Pride Born"}
        </div>
        {!collapsed && (
          <div style={{ fontSize: 9, color: C.textMut, marginTop: 2, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600 }}>
            Ventures Platform
          </div>
        )}
      </div>
      <div style={{ padding: "10px 6px", flex: 1, overflowY: "auto" }}>
        {NAV.map((n, idx) => (
          <div key={n.id}>
            {idx === NAV.length - 1 && <div style={{ height: 1, background: C.border, margin: "8px 10px" }} />}
            <div
              onClick={() => setActive(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: collapsed ? "10px 0" : "10px 13px",
                borderRadius: 9,
                marginBottom: 1,
                cursor: "pointer",
                transition: "all 0.12s",
                background: active === n.id ? C.accentGlow : "transparent",
                color: active === n.id ? C.accent : C.textSec,
                justifyContent: collapsed ? "center" : "flex-start",
                border: active === n.id ? `1px solid ${C.accentBorder}` : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (active !== n.id) {
                  e.currentTarget.style.background = C.surfaceAlt;
                  e.currentTarget.style.color = C.text;
                }
              }}
              onMouseLeave={(e) => {
                if (active !== n.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = C.textSec;
                }
              }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
              {!collapsed && <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>{n.label}</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px 6px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: collapsed ? "6px 0" : "6px 13px", justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            PB
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text }}>Pride Born</div>
              <div style={{ fontSize: 9.5, color: C.textMut }}>Growth Plan</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
