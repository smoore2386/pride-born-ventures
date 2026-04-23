"use client";

import { useState } from "react";
import { C, mono } from "../../theme";
import { INDUSTRIES } from "./data";
import { Btn } from "./ui";

export default function AudienceView() {
  const [industry, setIndustry] = useState("home");
  const [filters, setFilters] = useState(["HOMEOWNER", "INCOME", "ZIP"]);
  const [size, setSize] = useState(24650);
  const [matchBy, setMatchBy] = useState("NAME,ADDRESS");

  const toggle = (f) => {
    setFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
    setSize((prev) => Math.max(800, prev + (Math.random() > 0.5 ? -1 : 1) * Math.floor(Math.random() * 4000 + 1000)));
  };

  const filterGroups = [
    { label: "Location", items: ["ZIP", "CITY", "STATE", "RADIUS"] },
    { label: "Demographics", items: ["AGE", "INCOME", "GENDER", "EDUCATION"] },
    { label: "Property", items: ["HOMEOWNER", "HOME_VALUE", "PROPERTY_TYPE", "YEAR_BUILT"] },
    { label: "Behavioral", items: ["RECENT_MOVER", "LIFE_EVENTS", "PURCHASE_INTENT", "ONLINE_ACTIVITY"] },
    { label: "Data Quality", items: ["EMAIL_VALID", "DNC_CLEAN", "PHONE_VERIFIED", "ADDRESS_MATCHED"] },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Audience Builder</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          Build targeted audiences using AudienceLab's consumer + business data
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
          Industry Vertical
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.id}
              onClick={() => { setIndustry(ind.id); setSize(Math.floor(Math.random() * 30000 + 8000)); }}
              style={{
                padding: "12px 16px", borderRadius: 11, cursor: "pointer", transition: "all 0.15s",
                background: industry === ind.id ? C.accentGlow : C.card,
                border: `1px solid ${industry === ind.id ? C.accentBorder : C.border}`,
                color: industry === ind.id ? C.accent : C.textSec, minWidth: 130,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 3 }}>{ind.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{ind.label}</div>
              <div style={{ fontSize: 10, color: C.textMut, marginTop: 1 }}>{ind.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 2 }}>
          {filterGroups.map((g) => (
            <div key={g.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {g.items.map((f) => (
                  <div
                    key={f}
                    onClick={() => toggle(f)}
                    style={{
                      padding: "7px 13px", borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                      background: filters.includes(f) ? C.accentGlow : C.card,
                      border: `1px solid ${filters.includes(f) ? C.accentBorder : C.border}`,
                      color: filters.includes(f) ? C.accent : C.textSec,
                      transition: "all 0.12s",
                    }}
                  >
                    {filters.includes(f) && "✓ "}{f.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              Skiptrace Match Accuracy
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["NAME", "ADDRESS", "NAME,ADDRESS", "COMPANY_ADDRESS"].map((m) => (
                <div
                  key={m}
                  onClick={() => setMatchBy(m)}
                  style={{
                    padding: "7px 12px", borderRadius: 7, fontSize: 11, fontFamily: mono, cursor: "pointer",
                    background: matchBy === m ? C.greenSoft : C.surfaceAlt,
                    border: `1px solid ${matchBy === m ? C.greenBorder : C.border}`,
                    color: matchBy === m ? C.green : C.textMut,
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: C.textMut, marginTop: 6 }}>
              Maps to SKIPTRACE_MATCH_BY — higher accuracy = fewer but better-verified records
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, textAlign: "center", position: "sticky", top: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
              Estimated Audience
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.accent, letterSpacing: "-1px" }}>
              {size.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}>matching records</div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              <Btn primary>Pull Leads →</Btn>
              <Btn>Push to FB / Google Ads</Btn>
              <Btn>Save Audience</Btn>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, textAlign: "left" }}>
              <div style={{ fontSize: 10, color: C.textMut, marginBottom: 6 }}>Active Filters ({filters.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {filters.map((f) => (
                  <span
                    key={f}
                    style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 5, background: C.surfaceAlt, color: C.textSec, border: `1px solid ${C.border}` }}
                  >
                    {f.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.textMut, marginTop: 10 }}>
                Match: <span style={{ fontFamily: mono, color: C.green }}>{matchBy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
