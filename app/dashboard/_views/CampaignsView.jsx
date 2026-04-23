"use client";

import { useState } from "react";
import { orderBy, limit } from "firebase/firestore";
import { C, font, mono } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection } from "../../../lib/hooks/useFirestore";
import { Badge, Btn, Input, TabBar, Empty } from "./ui";

export default function CampaignsView() {
  const { orgId } = useAuth();
  const [tab, setTab] = useState("email");
  const { data: campaigns, loading } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/campaigns` : null,
    [orderBy("createdAt", "desc"), limit(20)]
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Campaigns</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          Launch email and SMS outreach to your AudienceLab audiences
        </p>
      </div>

      <TabBar tabs={[{ id: "email", label: "Email" }, { id: "sms", label: "SMS" }]} active={tab} onChange={setTab} />

      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>
            New {tab === "email" ? "Email" : "SMS"} Campaign
          </div>
          <Input label="Campaign Name" placeholder="e.g. Spring HVAC Promo" value="" onChange={() => {}} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
              Audience Source
            </label>
            <select
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
                fontSize: 13, outline: "none", fontFamily: font,
              }}
            >
              <option>Austin Homeowners $85K+ (AudienceLab)</option>
              <option>PI Leads — Central TX (AudienceLab)</option>
              <option>Website Visitors — Last 7 Days (Pixel)</option>
            </select>
          </div>
          {tab === "email" && <Input label="Subject Line" placeholder="e.g. Save 20% on your AC tune-up" value="" onChange={() => {}} />}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
              Message
            </label>
            <textarea
              rows={tab === "email" ? 5 : 3}
              placeholder={tab === "email" ? "Write your email body..." : "SMS message (160 chars)..."}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
                fontSize: 13, outline: "none", resize: "vertical", fontFamily: font, boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary style={{ flex: 1 }} disabled>Send Now (Phase 4)</Btn>
            <Btn disabled>Schedule</Btn>
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: C.textMut, fontFamily: mono }}>
            {tab === "email"
              ? "Uses PERSONAL_EMAIL with VALIDATION_STATUS = Valid"
              : "Uses SKIPTRACE_WIRELESS_NUMBERS, excludes DNC = Y"}
          </div>
        </div>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Active Campaigns</div>
          {!loading && campaigns.length === 0 ? (
            <Empty title="No campaigns yet" body="Campaign delivery ships in Phase 4 (Postmark + Twilio). You can draft above now; sends activate when A2P registration clears." />
          ) : (
            campaigns.map((c, i) => (
              <div key={c.id} style={{ padding: "13px 0", borderBottom: i < campaigns.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</span>
                  <Badge color={C.green} bg={C.greenSoft} border={C.greenBorder}>
                    {c.status || "draft"}
                  </Badge>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.textMut }}>
                  <span>{c.channel}</span>
                  <span>Sent: {(c.stats?.sent ?? 0).toLocaleString()}</span>
                  <span>Open: {c.stats?.sent ? Math.round(((c.stats.opened ?? 0) / c.stats.sent) * 100) : 0}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
