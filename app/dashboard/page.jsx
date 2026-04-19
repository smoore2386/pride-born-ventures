"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Theme ───
const C = {
  bg: "#060B14", surface: "#0C1220", surfaceAlt: "#111A2C",
  card: "#131D30", cardHover: "#172340", border: "#1A2540", borderLight: "#243355",
  accent: "#2D7FF9", accentGlow: "rgba(45,127,249,0.12)", accentBorder: "rgba(45,127,249,0.25)",
  green: "#00C48C", greenSoft: "rgba(0,196,140,0.10)", greenBorder: "rgba(0,196,140,0.25)",
  amber: "#FFB020", amberSoft: "rgba(255,176,32,0.10)", amberBorder: "rgba(255,176,32,0.25)",
  red: "#FF4D4F", redSoft: "rgba(255,77,79,0.10)",
  purple: "#7C5CFC", purpleSoft: "rgba(124,92,252,0.10)",
  cyan: "#00BCD4",
  text: "#E8EDF5", textSec: "#8899B4", textMut: "#556B8A",
};

const font = "'Satoshi', 'General Sans', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', 'Fira Code', monospace";

// ─── AudienceLab Field Mapping ───
const AL_FIELDS = {
  contact: [
    { key: "FIRST_NAME", label: "First Name", type: "text" },
    { key: "LAST_NAME", label: "Last Name", type: "text" },
    { key: "PERSONAL_EMAIL", label: "Personal Email", type: "email" },
    { key: "BUSINESS_EMAIL", label: "Business Email", type: "email" },
    { key: "PERSONAL_EMAIL_VALIDATION_STATUS", label: "Email Validation", type: "status" },
    { key: "BUSINESS_EMAIL_VALIDATION_STATUS", label: "Biz Email Validation", type: "status" },
    { key: "PERSONAL_EMAIL_LAST_SEEN", label: "Email Last Seen", type: "date" },
  ],
  phone: [
    { key: "SKIPTRACE_WIRELESS_NUMBERS", label: "Mobile Phone", type: "phone" },
    { key: "SKIPTRACE_LANDLINE_NUMBERS", label: "Landline", type: "phone" },
    { key: "SKIPTRACE_B2B_WIRELESS", label: "B2B Mobile", type: "phone" },
    { key: "SKIPTRACE_B2B_LANDLINE", label: "B2B Landline", type: "phone" },
    { key: "DNC", label: "Do Not Call", type: "flag" },
  ],
  address: [
    { key: "SKIPTRACE_ADDRESS", label: "Mailing Address", type: "address" },
    { key: "CITY", label: "City", type: "text" },
    { key: "STATE", label: "State", type: "text" },
    { key: "ZIP", label: "ZIP Code", type: "text" },
  ],
  demographics: [
    { key: "AGE", label: "Age", type: "number" },
    { key: "GENDER", label: "Gender", type: "text" },
    { key: "INCOME", label: "Income Range", type: "range" },
    { key: "HOMEOWNER", label: "Homeowner", type: "boolean" },
    { key: "HOME_VALUE", label: "Home Value", type: "currency" },
    { key: "PROPERTY_TYPE", label: "Property Type", type: "text" },
  ],
  matching: [
    { key: "SKIPTRACE_MATCH_BY", label: "Match By", type: "select", options: ["NAME", "ADDRESS", "NAME,ADDRESS", "COMPANY_ADDRESS"] },
    { key: "SKIPTRACE_B2B_MATCH_BY", label: "B2B Match By", type: "select", options: ["COMPANY_ADDRESS"] },
  ],
  hashed: [
    { key: "SHA256_PERSONAL_EMAIL", label: "SHA256 Email (Ads)", type: "hash" },
    { key: "SHA256_MOBILE_PHONE", label: "SHA256 Phone (Ads)", type: "hash" },
  ],
};

const INDUSTRIES = [
  { id: "home", label: "Home Services", icon: "\u{1F3E0}", desc: "HVAC, Plumbing, Roofing, Electrical" },
  { id: "legal", label: "PI Lawyers", icon: "\u2696\uFE0F", desc: "Personal Injury, Auto Accidents" },
  { id: "medspa", label: "Med Spas", icon: "\u{1F489}", desc: "Botox, Fillers, Laser, Wellness" },
  { id: "insurance", label: "Insurance", icon: "\u{1F6E1}\uFE0F", desc: "Auto, Home, Life, Health" },
  { id: "agency", label: "Agencies", icon: "\u{1F4CA}", desc: "Digital Marketing, Lead Gen" },
];

const SAMPLE_LEADS = [
  { first: "Sarah", last: "Mitchell", email: "s.mitchell@gmail.com", emailStatus: "Valid", phone: "(512) 555-0142", city: "Austin", state: "TX", zip: "78701", income: "$85K-$100K", homeowner: true, age: 34, gender: "F", status: "new", source: "audience" },
  { first: "James", last: "Cooper", email: "jcooper77@yahoo.com", emailStatus: "Valid", phone: "(512) 555-0298", city: "Round Rock", state: "TX", zip: "78664", income: "$100K-$125K", homeowner: true, age: 42, gender: "M", status: "new", source: "pixel" },
  { first: "Maria", last: "Gonzalez", email: "maria.g@outlook.com", emailStatus: "Valid", phone: "(737) 555-0183", city: "Cedar Park", state: "TX", zip: "78613", income: "$75K-$85K", homeowner: true, age: 29, gender: "F", status: "contacted", source: "audience" },
  { first: "David", last: "Kim", email: "dkim.tx@gmail.com", emailStatus: "Valid", phone: "(512) 555-0371", city: "Georgetown", state: "TX", zip: "78626", income: "$125K-$150K", homeowner: true, age: 51, gender: "M", status: "contacted", source: "audience" },
  { first: "Ashley", last: "Turner", email: "a.turner@icloud.com", emailStatus: "Risky", phone: "(737) 555-0455", city: "Pflugerville", state: "TX", zip: "78660", income: "$60K-$75K", homeowner: false, age: 26, gender: "F", status: "new", source: "pixel" },
  { first: "Robert", last: "Chen", email: "rchen92@gmail.com", emailStatus: "Valid", phone: "(512) 555-0516", city: "Austin", state: "TX", zip: "78731", income: "$150K+", homeowner: true, age: 45, gender: "M", status: "closed", source: "audience" },
  { first: "Jennifer", last: "Reyes", email: "jreyes@gmail.com", emailStatus: "Valid", phone: "(512) 555-0627", city: "Lakeway", state: "TX", zip: "78734", income: "$100K-$125K", homeowner: true, age: 38, gender: "F", status: "new", source: "audience" },
  { first: "Marcus", last: "Johnson", email: "mjohnson@hotmail.com", emailStatus: "Unknown", phone: "(737) 555-0738", city: "Leander", state: "TX", zip: "78641", income: "$85K-$100K", homeowner: true, age: 33, gender: "M", status: "contacted", source: "pixel" },
];

// ─── Shared Components ───
const Badge = ({ children, color, bg, border }) => (
  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: bg, color, border: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{children}</span>
);

const StatusBadge = ({ status }) => {
  const m = { new: [C.accent, C.accentGlow, C.accentBorder], contacted: [C.amber, C.amberSoft, C.amberBorder], closed: [C.green, C.greenSoft, C.greenBorder] };
  const [c, bg, b] = m[status] || m.new;
  return <Badge color={c} bg={bg} border={b}>{status}</Badge>;
};

const Metric = ({ label, value, change, icon, color = C.accent }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 160, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + "66"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
    <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: color, opacity: 0.04 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{value}</div>
    {change != null && <div style={{ fontSize: 11, color: change >= 0 ? C.green : C.red, marginTop: 4, fontWeight: 600 }}>{change >= 0 ? "\u2191" : "\u2193"} {Math.abs(change)}% vs last week</div>}
  </div>
);

const Btn = ({ children, primary, small, onClick, style: s = {} }) => (
  <button onClick={onClick} style={{ padding: small ? "6px 14px" : "10px 20px", borderRadius: small ? 8 : 10, background: primary ? C.accent : "transparent", color: primary ? "#fff" : C.textSec, border: primary ? "none" : `1px solid ${C.border}`, fontSize: small ? 11 : 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s", ...s }}>{children}</button>
);

const Input = ({ label, placeholder, value, onChange, type = "text", isMono }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>{label}</label>}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: isMono ? mono : font, transition: "border-color 0.15s" }} onFocus={e => e.target.style.borderColor = C.accent + "66"} onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const Spark = ({ data, color, h = 36 }) => {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - ((v - min) / r) * (h - 4) - 2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#g${color.slice(1)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 2, background: C.card, borderRadius: 10, padding: 3, width: "fit-content", border: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: active === t.id ? C.accent : "transparent", color: active === t.id ? "#fff" : C.textMut, fontFamily: font, transition: "all 0.15s" }}>{t.label}</button>
    ))}
  </div>
);

// ─── Sidebar ───
const NAV = [
  { id: "dashboard", icon: "\u2B21", label: "Dashboard" },
  { id: "audience", icon: "\u25CE", label: "Audience Builder" },
  { id: "leads", icon: "\u25C7", label: "Lead Data" },
  { id: "pixel", icon: "\u25C8", label: "Visitor Tracking" },
  { id: "campaigns", icon: "\u25B3", label: "Campaigns" },
  { id: "crm", icon: "\u25A4", label: "CRM Pipeline" },
  { id: "ads", icon: "\u2B22", label: "Ad Integration" },
  { id: "settings", icon: "\u2699", label: "Settings" },
];

const Sidebar = ({ active, setActive, collapsed }) => (
  <div style={{ width: collapsed ? 62 : 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease", flexShrink: 0, overflow: "hidden" }}>
    <div style={{ padding: collapsed ? "22px 0" : "22px 20px", textAlign: collapsed ? "center" : "left", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: collapsed ? 16 : 15, fontWeight: 900, color: C.text, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
        {collapsed ? "PB" : "Pride Born"}
      </div>
      {!collapsed && <div style={{ fontSize: 9, color: C.textMut, marginTop: 2, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600 }}>Ventures Platform</div>}
    </div>
    <div style={{ padding: "10px 6px", flex: 1, overflowY: "auto" }}>
      {NAV.map((n, idx) => (
        <div key={n.id}>
          {idx === 7 && <div style={{ height: 1, background: C.border, margin: "8px 10px" }} />}
          <div onClick={() => setActive(n.id)} style={{
            display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "10px 0" : "10px 13px",
            borderRadius: 9, marginBottom: 1, cursor: "pointer", transition: "all 0.12s",
            background: active === n.id ? C.accentGlow : "transparent",
            color: active === n.id ? C.accent : C.textSec,
            justifyContent: collapsed ? "center" : "flex-start",
            border: active === n.id ? `1px solid ${C.accentBorder}` : "1px solid transparent",
          }}
          onMouseEnter={e => { if (active !== n.id) { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.color = C.text; } }}
          onMouseLeave={e => { if (active !== n.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSec; } }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
            {!collapsed && <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>{n.label}</span>}
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: "14px 6px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: collapsed ? "6px 0" : "6px 13px", justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>PB</div>
        {!collapsed && <div><div style={{ fontSize: 11.5, fontWeight: 600, color: C.text }}>Pride Born</div><div style={{ fontSize: 9.5, color: C.textMut }}>Growth Plan</div></div>}
      </div>
    </div>
  </div>
);

// ─── Settings / API Config ───
const SettingsView = ({ apiKey, setApiKey, webhookUrl, setWebhookUrl, connected, setConnected }) => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("api");
  const [selectedFields, setSelectedFields] = useState(["FIRST_NAME", "LAST_NAME", "PERSONAL_EMAIL", "SKIPTRACE_WIRELESS_NUMBERS", "SKIPTRACE_ADDRESS", "CITY", "STATE", "ZIP", "INCOME", "HOMEOWNER", "AGE", "GENDER", "DNC", "PERSONAL_EMAIL_VALIDATION_STATUS"]);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      if (apiKey && apiKey.length > 8) {
        setTestResult({ ok: true, msg: "Connected to AudienceLab V3 \u2014 14 audiences found" });
        setConnected(true);
      } else {
        setTestResult({ ok: false, msg: "Invalid API key. Get yours at app.audiencelab.io/account \u2192 API Keys" });
        setConnected(false);
      }
      setTesting(false);
    }, 1500);
  };

  const toggleField = (key) => setSelectedFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>Configure your AudienceLab connection and platform settings</p>
      </div>
      <TabBar tabs={[{ id: "api", label: "API Connection" }, { id: "fields", label: "Data Fields" }, { id: "webhook", label: "Webhooks" }, { id: "pixel", label: "Pixel Config" }]} active={activeTab} onChange={setActiveTab} />

      {activeTab === "api" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.accent }}>AL</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>AudienceLab V3</div>
                  <div style={{ fontSize: 11, color: connected ? C.green : C.textMut, fontWeight: 500 }}>{connected ? "\u25CF Connected" : "\u25CB Not connected"}</div>
                </div>
              </div>
              <Input label="API Key" placeholder="paste your AudienceLab API key" value={apiKey} onChange={e => setApiKey(e.target.value)} isMono />
              <div style={{ fontSize: 11, color: C.textMut, marginTop: -8, marginBottom: 14 }}>
                Get your key from <span style={{ color: C.accent }}>app.audiencelab.io/account</span> \u2192 API Keys \u2192 Create with "write" permission
              </div>
              <Input label="API Base URL" placeholder="https://app.audiencelab.io/api/v3" value="https://app.audiencelab.io/api/v3" onChange={() => {}} />
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn primary onClick={testConnection}>{testing ? "Testing..." : "Test Connection"}</Btn>
                <Btn onClick={() => { setApiKey(""); setConnected(false); setTestResult(null); }}>Disconnect</Btn>
              </div>
              {testResult && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: testResult.ok ? C.greenSoft : C.redSoft, border: `1px solid ${testResult.ok ? C.greenBorder : "rgba(255,77,79,0.25)"}`, color: testResult.ok ? C.green : C.red, fontSize: 12, fontWeight: 500 }}>
                  {testResult.ok ? "\u2713 " : "\u2717 "}{testResult.msg}
                </div>
              )}
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>AudienceSync CDP</div>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>Optional: Use AudienceSync for automated, scheduled data syncs</div>
              <Input label="AudienceSync URL" placeholder="https://cdp.audiencelab.io" value="https://cdp.audiencelab.io" onChange={() => {}} />
              <Input label="HTTP Destination Endpoint" placeholder="https://api.prideborn.io/webhook/audiencelab" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
              <div style={{ fontSize: 11, color: C.textMut, marginTop: -8 }}>
                Point AudienceSync's HTTP destination here to receive lead data automatically
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Integration Flow</div>
              {[
                { step: 1, title: "Connect API", desc: "Add your AudienceLab API key", done: connected },
                { step: 2, title: "Select Fields", desc: "Choose which data fields to pull", done: connected && selectedFields.length > 5 },
                { step: 3, title: "Build Audience", desc: "Use the Audience Builder to define targets", done: false },
                { step: 4, title: "Pull Leads", desc: "Fetch matched records from AudienceLab", done: false },
                { step: 5, title: "Launch Campaign", desc: "Send email/SMS or push to ads", done: false },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: s.done ? C.green : C.surfaceAlt, border: `2px solid ${s.done ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: s.done ? "#fff" : C.textMut, flexShrink: 0, marginTop: 1 }}>{s.done ? "\u2713" : s.step}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: s.done ? C.text : C.textSec }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: C.textMut }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Data Sources</div>
              {[
                { name: "Online Primary", desc: "Web activity, opt-ins", color: C.accent },
                { name: "Offline Dataset", desc: "Public records, credit header", color: C.green },
                { name: "Scrape Traced", desc: "Enrichment via skiptrace", color: C.purple },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: C.textMut }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "fields" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>AudienceLab Data Fields</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 20 }}>Select which fields to include when pulling leads. These map directly to AudienceLab's field schema.</div>
          {Object.entries(AL_FIELDS).map(([cat, fields]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {fields.map(f => (
                  <div key={f.key} onClick={() => toggleField(f.key)} style={{
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer", transition: "all 0.12s",
                    background: selectedFields.includes(f.key) ? C.accentGlow : C.surfaceAlt,
                    border: `1px solid ${selectedFields.includes(f.key) ? C.accentBorder : C.border}`,
                    color: selectedFields.includes(f.key) ? C.accent : C.textSec,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{selectedFields.includes(f.key) && "\u2713 "}{f.label}</div>
                    <div style={{ fontSize: 9.5, color: C.textMut, fontFamily: mono, marginTop: 2 }}>{f.key}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 10, background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSec }}>{selectedFields.length} fields selected</span>
            <span style={{ fontSize: 11, color: C.textMut, marginLeft: 12 }}>These will be included in every lead pull and export</span>
          </div>
        </div>
      )}

      {activeTab === "webhook" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Inbound Webhook</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>Receive real-time leads from AudienceLab V3 webhooks or AudienceSync CDP</div>
            <Input label="Your Webhook URL" placeholder="https://api.prideborn.io/webhook/inbound" value="https://api.prideborn.io/webhook/inbound" onChange={() => {}} />
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Auth Header</div>
            <pre style={{ background: C.bg, borderRadius: 8, padding: 14, fontFamily: mono, fontSize: 11.5, color: C.textSec, border: `1px solid ${C.border}`, lineHeight: 1.7, marginBottom: 14, whiteSpace: "pre-wrap", margin: "0 0 14px 0" }}>
{`Authorization: Bearer <YOUR_PRIDE_BORN_TOKEN>
Content-Type: application/json`}
            </pre>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Example Payload</div>
            <pre style={{ background: C.bg, borderRadius: 8, padding: 14, fontFamily: mono, fontSize: 10.5, color: C.textSec, border: `1px solid ${C.border}`, lineHeight: 1.6, whiteSpace: "pre-wrap", overflowX: "auto", margin: 0 }}>
{`{
  "FIRST_NAME": "Sarah",
  "LAST_NAME": "Mitchell",
  "PERSONAL_EMAIL": "s.mitchell@gmail.com",
  "PERSONAL_EMAIL_VALIDATION_STATUS": "Valid",
  "SKIPTRACE_WIRELESS_NUMBERS": "(512) 555-0142",
  "SKIPTRACE_ADDRESS": "1234 Oak Lane",
  "CITY": "Austin",
  "STATE": "TX",
  "ZIP": "78701",
  "INCOME": "$85K-$100K",
  "HOMEOWNER": true,
  "AGE": 34,
  "DNC": "N"
}`}
            </pre>
          </div>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Outbound Webhooks</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>Push lead events from Pride Born to external systems</div>
            {[
              { event: "lead.new", desc: "When a new lead enters the system", active: true },
              { event: "lead.contacted", desc: "When a lead status changes to contacted", active: true },
              { event: "lead.closed", desc: "When a deal is marked as closed", active: false },
              { event: "campaign.sent", desc: "When a campaign finishes sending", active: false },
              { event: "pixel.match", desc: "When a visitor is identified via pixel", active: true },
            ].map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: mono }}>{w.event}</div>
                  <div style={{ fontSize: 11, color: C.textMut }}>{w.desc}</div>
                </div>
                <div style={{ width: 36, height: 20, borderRadius: 99, background: w.active ? C.green : C.surfaceAlt, border: `1px solid ${w.active ? C.greenBorder : C.border}`, position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: w.active ? 19 : 2, transition: "left 0.2s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "pixel" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>SuperPixel Configuration</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>AudienceLab V3 SuperPixel for website visitor identification. White-label ready.</div>
          <Input label="Pixel ID" placeholder="pb-xxxxxxxx" value="pb-7x9k2m" onChange={() => {}} isMono />
          <Input label="Whitelabel Domain" placeholder="t.yourdomain.com" value="t.prideborn.io" onChange={() => {}} isMono />
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Install Snippet</div>
          <pre style={{ background: C.bg, borderRadius: 8, padding: 16, fontFamily: mono, fontSize: 12, color: C.textSec, border: `1px solid ${C.border}`, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "0 0 12px 0" }}>
{`<!-- Pride Born SuperPixel -->
<script src="https://t.prideborn.io/v3/px.js"
  data-id="pb-7x9k2m"
  data-webhook="https://api.prideborn.io/webhook/pixel"
  data-dedup="true" async></script>`}
          </pre>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small>Copy Snippet</Btn>
            <Btn small>Download as Tag</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Dashboard ───
const DashboardView = ({ connected }) => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Dashboard</h2>
      <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
        {connected ? "Live data from AudienceLab \u2014 all systems operational" : "Connect your AudienceLab API key in Settings to activate live data"}
      </p>
    </div>
    {!connected && (
      <div style={{ background: C.amberSoft, border: `1px solid ${C.amberBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18 }}>{"\u26A0\uFE0F"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>API not connected</div>
          <div style={{ fontSize: 12, color: C.textSec }}>Go to Settings \u2192 API Connection to add your AudienceLab key and start pulling live data.</div>
        </div>
      </div>
    )}
    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
      <Metric label="Total Leads" value="12,847" change={18} icon={"\u{1F465}"} color={C.accent} />
      <Metric label="Active Campaigns" value="7" change={40} icon={"\u{1F4E4}"} color={C.purple} />
      <Metric label="Pixel Visitors" value="3,291" change={-5} icon={"\u{1F441}\uFE0F"} color={C.amber} />
      <Metric label="Deals Closed" value="142" change={23} icon={"\u{1F91D}"} color={C.green} />
    </div>
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      <div style={{ flex: 2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Lead Acquisition</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["7D", "30D", "90D"].map(p => (
              <span key={p} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: p === "30D" ? C.accentGlow : "transparent", color: p === "30D" ? C.accent : C.textMut, cursor: "pointer", fontWeight: 600, border: p === "30D" ? `1px solid ${C.accentBorder}` : "1px solid transparent" }}>{p}</span>
            ))}
          </div>
        </div>
        <Spark data={[120, 180, 150, 220, 280, 240, 310, 290, 350, 380, 420, 460, 440, 510]} color={C.accent} h={110} />
      </div>
      <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>By Industry</span>
        <div style={{ marginTop: 14 }}>
          {[{ l: "Home Services", p: 38, c: C.accent }, { l: "Insurance", p: 26, c: C.green }, { l: "Med Spas", p: 18, c: C.purple }, { l: "PI Lawyers", p: 12, c: C.amber }, { l: "Agencies", p: 6, c: C.red }].map(s => (
            <div key={s.l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, color: C.textSec }}>{s.l}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{s.p}%</span>
              </div>
              <div style={{ height: 4, background: C.surfaceAlt, borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${s.p}%`, background: s.c, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Recent Leads</span>
        <div style={{ marginTop: 12 }}>
          {SAMPLE_LEADS.slice(0, 5).map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: [C.accentGlow, C.greenSoft, C.purpleSoft, C.amberSoft, C.redSoft][i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: [C.accent, C.green, C.purple, C.amber, C.red][i % 5] }}>
                  {l.first[0]}{l.last[0]}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{l.first} {l.last}</div>
                  <div style={{ fontSize: 10.5, color: C.textMut }}>{l.city}, {l.state} {l.source === "pixel" ? "\u{1F50D} Pixel" : "\u{1F4CB} Audience"}</div>
                </div>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Data Pipeline</span>
          <Badge color={connected ? C.green : C.amber} bg={connected ? C.greenSoft : C.amberSoft} border={connected ? C.greenBorder : C.amberBorder}>{connected ? "Live" : "Offline"}</Badge>
        </div>
        {[
          { label: "AudienceLab API", status: connected, detail: "V3 \u00B7 List Audiences + Get File" },
          { label: "AudienceSync CDP", status: false, detail: "HTTP Endpoint \u00B7 Incremental Sync" },
          { label: "SuperPixel", status: true, detail: "V3 \u00B7 White-labeled \u00B7 Dedup active" },
          { label: "Facebook Sync", status: true, detail: "SHA256 email + phone hashing" },
          { label: "Google Ads", status: true, detail: "SHA256 email custom audiences" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
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

// ─── Audience Builder ───
const AudienceView = () => {
  const [industry, setIndustry] = useState("home");
  const [filters, setFilters] = useState(["HOMEOWNER", "INCOME", "ZIP"]);
  const [size, setSize] = useState(24650);
  const [matchBy, setMatchBy] = useState("NAME,ADDRESS");
  const toggle = f => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
    setSize(prev => Math.max(800, prev + (Math.random() > 0.5 ? -1 : 1) * Math.floor(Math.random() * 4000 + 1000)));
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
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>Build targeted audiences using AudienceLab's consumer + business data</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Industry Vertical</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {INDUSTRIES.map(ind => (
            <div key={ind.id} onClick={() => { setIndustry(ind.id); setSize(Math.floor(Math.random() * 30000 + 8000)); }}
              style={{ padding: "12px 16px", borderRadius: 11, cursor: "pointer", transition: "all 0.15s", background: industry === ind.id ? C.accentGlow : C.card, border: `1px solid ${industry === ind.id ? C.accentBorder : C.border}`, color: industry === ind.id ? C.accent : C.textSec, minWidth: 130 }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{ind.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{ind.label}</div>
              <div style={{ fontSize: 10, color: C.textMut, marginTop: 1 }}>{ind.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 2 }}>
          {filterGroups.map(g => (
            <div key={g.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {g.items.map(f => (
                  <div key={f} onClick={() => toggle(f)} style={{
                    padding: "7px 13px", borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                    background: filters.includes(f) ? C.accentGlow : C.card,
                    border: `1px solid ${filters.includes(f) ? C.accentBorder : C.border}`,
                    color: filters.includes(f) ? C.accent : C.textSec, transition: "all 0.12s",
                  }}>
                    {filters.includes(f) && "\u2713 "}{f.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Skiptrace Match Accuracy</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["NAME", "ADDRESS", "NAME,ADDRESS", "COMPANY_ADDRESS"].map(m => (
                <div key={m} onClick={() => setMatchBy(m)} style={{
                  padding: "7px 12px", borderRadius: 7, fontSize: 11, fontFamily: mono, cursor: "pointer",
                  background: matchBy === m ? C.greenSoft : C.surfaceAlt,
                  border: `1px solid ${matchBy === m ? C.greenBorder : C.border}`,
                  color: matchBy === m ? C.green : C.textMut,
                }}>{m}</div>
              ))}
            </div>
            <div style={{ fontSize: 10.5, color: C.textMut, marginTop: 6 }}>Maps to SKIPTRACE_MATCH_BY \u2014 higher accuracy = fewer but better-verified records</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, textAlign: "center", position: "sticky", top: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Estimated Audience</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.accent, letterSpacing: "-1px" }}>{size.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}>matching records</div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 7 }}>
              <Btn primary>Pull Leads \u2192</Btn>
              <Btn>Push to FB / Google Ads</Btn>
              <Btn>Save Audience</Btn>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, textAlign: "left" }}>
              <div style={{ fontSize: 10, color: C.textMut, marginBottom: 6 }}>Active Filters ({filters.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {filters.map(f => <span key={f} style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 5, background: C.surfaceAlt, color: C.textSec, border: `1px solid ${C.border}` }}>{f.replace(/_/g, " ")}</span>)}
              </div>
              <div style={{ fontSize: 10, color: C.textMut, marginTop: 10 }}>Match: <span style={{ fontFamily: mono, color: C.green }}>{matchBy}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Lead Data ───
const LeadsView = () => {
  const [sel, setSel] = useState([]);
  const tog = i => setSel(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  const togAll = () => setSel(sel.length === SAMPLE_LEADS.length ? [] : SAMPLE_LEADS.map((_, i) => i));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Lead Data</h2>
          <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>AudienceLab records \u2014 verified contacts with skiptrace matching</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small>{"\u2193"} Export CSV</Btn>
          <Btn small primary>+ Add to Campaign</Btn>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1.3fr 1fr 0.8fr 0.7fr 0.6fr 60px 60px 80px", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: C.surfaceAlt }}>
          <div onClick={togAll} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${sel.length === SAMPLE_LEADS.length ? C.accent : C.borderLight}`, background: sel.length === SAMPLE_LEADS.length ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>{sel.length === SAMPLE_LEADS.length && "\u2713"}</div>
          </div>
          {["Name", "Email", "Phone", "Location", "Income", "Owner", "DNC", "Valid", "Status"].map(h => (
            <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</div>
          ))}
        </div>
        {SAMPLE_LEADS.map((l, i) => (
          <div key={i} onClick={() => tog(i)} style={{
            display: "grid", gridTemplateColumns: "36px 1fr 1.3fr 1fr 0.8fr 0.7fr 0.6fr 60px 60px 80px",
            padding: "10px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
            background: sel.includes(i) ? C.accentGlow : "transparent", transition: "background 0.08s",
          }}
          onMouseEnter={e => { if (!sel.includes(i)) e.currentTarget.style.background = C.surfaceAlt; }}
          onMouseLeave={e => { if (!sel.includes(i)) e.currentTarget.style.background = "transparent"; }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${sel.includes(i) ? C.accent : C.borderLight}`, background: sel.includes(i) ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>{sel.includes(i) && "\u2713"}</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{l.first} {l.last}</div>
            <div style={{ fontSize: 11.5, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis" }}>{l.email}</div>
            <div style={{ fontSize: 11.5, color: C.textSec }}>{l.phone}</div>
            <div style={{ fontSize: 11.5, color: C.textSec }}>{l.city}, {l.state}</div>
            <div style={{ fontSize: 11.5, color: C.textSec }}>{l.income}</div>
            <div style={{ fontSize: 11.5, color: l.homeowner ? C.green : C.textMut }}>{l.homeowner ? "\u2713" : "\u2014"}</div>
            <div style={{ fontSize: 11.5, color: C.textMut }}>N</div>
            <div><Badge color={l.emailStatus === "Valid" ? C.green : C.amber} bg={l.emailStatus === "Valid" ? C.greenSoft : C.amberSoft} border={l.emailStatus === "Valid" ? C.greenBorder : C.amberBorder}>{l.emailStatus}</Badge></div>
            <div><StatusBadge status={l.status} /></div>
          </div>
        ))}
      </div>
      {sel.length > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", padding: "11px 22px", borderRadius: 12, fontSize: 12.5, fontWeight: 600, boxShadow: "0 8px 32px rgba(45,127,249,0.4)", display: "flex", gap: 14, alignItems: "center", zIndex: 50 }}>
          <span>{sel.length} selected</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Export</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Campaign</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>CRM</span>
          <span style={{ cursor: "pointer", textDecoration: "underline" }}>Push to Ads</span>
        </div>
      )}
    </div>
  );
};

// ─── Pixel ───
const PixelView = () => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Visitor Tracking</h2>
      <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>AudienceLab V3 SuperPixel \u2014 identify anonymous website visitors</p>
    </div>
    <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
      <Metric label="Visitors Today" value="284" change={12} icon={"\u{1F441}\uFE0F"} color={C.accent} />
      <Metric label="Identified" value="163" change={8} icon={"\u{1F3AF}"} color={C.green} />
      <Metric label="Match Rate" value="57%" change={3} icon={"\u{1F4CA}"} color={C.purple} />
    </div>
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Live Visitors</span>
        <Badge color={C.green} bg={C.greenSoft} border={C.greenBorder}>{"\u25CF"} Live</Badge>
      </div>
      {[
        { page: "/pricing", visits: 3, time: "2 min ago", device: "iPhone", loc: "Austin, TX", matched: true, name: "Sarah M." },
        { page: "/services/hvac", visits: 1, time: "8 min ago", device: "Desktop", loc: "Round Rock, TX", matched: true, name: "James C." },
        { page: "/contact", visits: 2, time: "15 min ago", device: "Android", loc: "Cedar Park, TX", matched: false, name: null },
        { page: "/pricing", visits: 5, time: "22 min ago", device: "Desktop", loc: "Georgetown, TX", matched: true, name: "David K." },
        { page: "/about", visits: 1, time: "34 min ago", device: "iPad", loc: "Austin, TX", matched: false, name: null },
      ].map((v, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.5fr 0.8fr 0.8fr 1fr 80px", padding: "11px 18px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
          <div><span style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{v.page}</span></div>
          <div style={{ fontSize: 11, color: C.textMut }}>{v.visits} views</div>
          <div style={{ fontSize: 11, color: C.textMut }}>{v.time}</div>
          <div style={{ fontSize: 11, color: C.textSec }}>{v.device}</div>
          <div style={{ fontSize: 11, color: C.textSec }}>{v.matched && v.name ? <span style={{ color: C.green, fontWeight: 500 }}>{v.name} \u00B7 {v.loc}</span> : v.loc}</div>
          <div><Badge color={v.matched ? C.green : C.textMut} bg={v.matched ? C.greenSoft : C.surfaceAlt} border={v.matched ? C.greenBorder : C.border}>{v.matched ? "Matched" : "Unknown"}</Badge></div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Campaigns ───
const CampaignsView = () => {
  const [tab, setTab] = useState("email");
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Campaigns</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>Launch email and SMS outreach to your AudienceLab audiences</p>
      </div>
      <TabBar tabs={[{ id: "email", label: "Email" }, { id: "sms", label: "SMS" }]} active={tab} onChange={setTab} />
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>New {tab === "email" ? "Email" : "SMS"} Campaign</div>
          <Input label="Campaign Name" placeholder="e.g. Spring HVAC Promo" value="" onChange={() => {}} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Audience Source</label>
            <select style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", fontFamily: font }}>
              <option>Austin Homeowners $85K+ (AudienceLab)</option>
              <option>PI Leads \u2014 Central TX (AudienceLab)</option>
              <option>Website Visitors \u2014 Last 7 Days (Pixel)</option>
              <option>Med Spa Prospects (AudienceLab)</option>
            </select>
          </div>
          {tab === "email" && <Input label="Subject Line" placeholder="e.g. Save 20% on your AC tune-up" value="" onChange={() => {}} />}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>Message</label>
            <textarea rows={tab === "email" ? 5 : 3} placeholder={tab === "email" ? "Write your email body..." : "SMS message (160 chars)..."} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: font, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary style={{ flex: 1 }}>Send Now</Btn>
            <Btn>Schedule</Btn>
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: C.textMut, fontFamily: mono }}>
            {tab === "email" ? "Uses PERSONAL_EMAIL with VALIDATION_STATUS = Valid" : "Uses SKIPTRACE_WIRELESS_NUMBERS, excludes DNC = Y"}
          </div>
        </div>
        <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Active Campaigns</div>
          {[
            { name: "HVAC Spring Promo", type: "Email", sent: 2400, opened: 892, replied: 124 },
            { name: "PI Leads \u2014 Austin", type: "SMS", sent: 1800, opened: 1620, replied: 312 },
            { name: "Insurance Cold Outreach", type: "Email", sent: 3100, opened: 1240, replied: 186 },
          ].map((c, i) => (
            <div key={i} style={{ padding: "13px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</span>
                <Badge color={C.green} bg={C.greenSoft} border={C.greenBorder}>Active</Badge>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.textMut }}>
                <span>{c.type}</span>
                <span>Sent: {c.sent.toLocaleString()}</span>
                <span>Open: {((c.opened / c.sent) * 100).toFixed(0)}%</span>
                <span style={{ color: C.green }}>Reply: {((c.replied / c.sent) * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CRM ───
const CRMView = () => {
  const stages = [
    { id: "new", label: "New Leads", color: C.accent, leads: SAMPLE_LEADS.filter(l => l.status === "new") },
    { id: "contacted", label: "Contacted", color: C.amber, leads: SAMPLE_LEADS.filter(l => l.status === "contacted") },
    { id: "closed", label: "Closed Won", color: C.green, leads: SAMPLE_LEADS.filter(l => l.status === "closed") },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>CRM Pipeline</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>Track leads from AudienceLab pull to closed deal</p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {stages.map(s => (
          <div key={s.id} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.textMut, background: C.surfaceAlt, padding: "2px 7px", borderRadius: 5 }}>{s.leads.length}</span>
            </div>
            <div style={{ padding: 8 }}>
              {s.leads.map((l, i) => (
                <div key={i} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 9, padding: 12, marginBottom: 6, cursor: "pointer", transition: "border-color 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "66"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 3 }}>{l.first} {l.last}</div>
                  <div style={{ fontSize: 10.5, color: C.textMut }}>{l.email}</div>
                  <div style={{ fontSize: 10.5, color: C.textMut }}>{l.city}, {l.state} \u00B7 {l.income}</div>
                  <div style={{ fontSize: 9.5, color: C.textMut, marginTop: 4 }}>via {l.source === "pixel" ? "\u{1F50D} Pixel" : "\u{1F4CB} Audience"}</div>
                </div>
              ))}
              <div style={{ padding: 8, textAlign: "center", borderRadius: 7, border: `1px dashed ${C.border}`, color: C.textMut, fontSize: 11, cursor: "pointer", marginTop: 2 }}>+ Add</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Ads ───
const AdsView = () => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Ad Integration</h2>
      <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>Push SHA256-hashed audiences to Facebook and Google Ads</p>
    </div>
    <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
      {[{ name: "Facebook Ads", icon: "f", color: "#1877F2", audiences: 3, field: "SHA256 Email + Phone" }, { name: "Google Ads", icon: "G", color: "#4285F4", audiences: 2, field: "SHA256 Email" }].map(p => (
        <div key={p.name} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff" }}>{p.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.name}</div>
              <div style={{ fontSize: 10, color: C.green, fontWeight: 500 }}>{"\u25CF"} Connected</div>
              <div style={{ fontSize: 9.5, color: C.textMut, fontFamily: mono, marginTop: 2 }}>{p.field}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{p.audiences}</div>
            <div style={{ fontSize: 10, color: C.textMut }}>synced</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Synced Audiences</div>
      {[
        { name: "Austin Homeowners $85K+", platform: "Facebook", size: "12,400", sync: "2h ago", hash: "SHA256_PERSONAL_EMAIL + SHA256_MOBILE_PHONE" },
        { name: "PI Leads \u2014 Central TX", platform: "Google", size: "4,200", sync: "6h ago", hash: "SHA256_PERSONAL_EMAIL" },
        { name: "Med Spa \u2014 Women 25-45", platform: "Facebook", size: "8,100", sync: "1d ago", hash: "SHA256_PERSONAL_EMAIL" },
        { name: "Pixel Retarget Pool", platform: "Facebook", size: "3,291", sync: "Live", hash: "SHA256_PERSONAL_EMAIL + SHA256_MOBILE_PHONE" },
      ].map((a, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.6fr 2fr", padding: "11px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{a.name}</div>
          <div style={{ fontSize: 11, color: C.textSec }}>{a.platform}</div>
          <div style={{ fontSize: 11, color: C.textSec }}>{a.size}</div>
          <div style={{ fontSize: 11, color: a.sync === "Live" ? C.green : C.textMut, fontWeight: a.sync === "Live" ? 600 : 400 }}>{a.sync}</div>
          <div style={{ fontSize: 10, color: C.textMut, fontFamily: mono }}>{a.hash}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main App ───
export default function App() {
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://api.prideborn.io/webhook/audiencelab");
  const [connected, setConnected] = useState(false);

  const views = {
    dashboard: <DashboardView connected={connected} />,
    audience: <AudienceView />,
    leads: <LeadsView />,
    pixel: <PixelView />,
    campaigns: <CampaignsView />,
    crm: <CRMView />,
    ads: <AdsView />,
    settings: <SettingsView apiKey={apiKey} setApiKey={setApiKey} webhookUrl={webhookUrl} setWebhookUrl={setWebhookUrl} connected={connected} setConnected={setConnected} />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: font, color: C.text, overflow: "hidden" }}>
      <Sidebar active={view} setActive={setView} collapsed={collapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: C.textMut, fontSize: 16, cursor: "pointer", padding: "4px 6px" }}>{"\u2630"}</button>
            <Link href="/" style={{ fontSize: 11, fontWeight: 600, color: C.textMut, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>{"\u2190 Site"}</Link>
            <div style={{ position: "relative" }}>
              <input placeholder="Search leads, audiences, campaigns..." style={{ width: 300, padding: "7px 12px 7px 32px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 12.5, outline: "none", fontFamily: font }} />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.textMut }}>{"\u2315"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 7, background: connected ? C.greenSoft : C.amberSoft, border: `1px solid ${connected ? C.greenBorder : C.amberBorder}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? C.green : C.amber }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: connected ? C.green : C.amber }}>{connected ? "API Live" : "API Offline"}</span>
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: 16, color: C.textMut }}>{"\u{1F514}"}</span>
              <div style={{ position: "absolute", top: -2, right: -3, width: 7, height: 7, borderRadius: "50%", background: C.red }} />
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, color: "#fff", cursor: "pointer" }}>SH</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {views[view]}
        </div>
      </div>
    </div>
  );
}
