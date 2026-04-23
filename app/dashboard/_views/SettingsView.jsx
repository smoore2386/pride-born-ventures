"use client";

import { useState } from "react";
import { C, mono } from "../../theme";
import { AL_FIELDS } from "./data";
import { Btn, Input, TabBar } from "./ui";

export default function SettingsView({ apiKey, setApiKey, webhookUrl, setWebhookUrl, connected, setConnected }) {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("api");
  const [seedStatus, setSeedStatus] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [selectedFields, setSelectedFields] = useState([
    "FIRST_NAME","LAST_NAME","PERSONAL_EMAIL","SKIPTRACE_WIRELESS_NUMBERS","SKIPTRACE_ADDRESS",
    "CITY","STATE","ZIP","INCOME","HOMEOWNER","AGE","GENDER","DNC","PERSONAL_EMAIL_VALIDATION_STATUS",
  ]);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    if (!apiKey || apiKey.trim().length < 8) {
      setTestResult({ ok: false, msg: "Paste an API key first. Get yours at app.audiencelab.io/account → API Keys (write scope)." });
      setConnected(false);
      setTesting(false);
      return;
    }
    try {
      const res = await fetch("/api/audiencelab/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setTestResult({ ok: true, msg: data.msg || "Connected to AudienceLab" });
        setConnected(true);
      } else {
        setTestResult({ ok: false, msg: data.error || `HTTP ${res.status} — check the key and try again` });
        setConnected(false);
      }
    } catch (err) {
      setTestResult({ ok: false, msg: err?.message || "Network error calling /api/audiencelab/test" });
      setConnected(false);
    } finally {
      setTesting(false);
    }
  };

  const seed = async (method) => {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const res = await fetch("/api/dev/seed", { method });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSeedStatus({
          ok: true,
          msg:
            method === "POST"
              ? `Seeded ${data.seeded?.leads ?? 0} leads, ${data.seeded?.visitors ?? 0} visitors, ${data.seeded?.deals ?? 0} deals`
              : `Cleared ${data.deleted ?? 0} docs across org subcollections`,
        });
      } else {
        setSeedStatus({ ok: false, msg: data.error || `HTTP ${res.status}` });
      }
    } catch (err) {
      setSeedStatus({ ok: false, msg: err?.message || "Network error" });
    } finally {
      setSeeding(false);
    }
  };

  const toggleField = (key) =>
    setSelectedFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          Configure your AudienceLab connection and platform settings
        </p>
      </div>
      <TabBar
        tabs={[
          { id: "api", label: "API Connection" },
          { id: "fields", label: "Data Fields" },
          { id: "webhook", label: "Webhooks" },
          { id: "pixel", label: "Pixel Config" },
          { id: "dev", label: "Dev Tools" },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "api" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 2 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                    border: `1px solid ${C.borderLight}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: C.accent,
                  }}
                >
                  AL
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>AudienceLab V3</div>
                  <div style={{ fontSize: 11, color: connected ? C.green : C.textMut, fontWeight: 500 }}>
                    {connected ? "● Connected" : "○ Not connected"}
                  </div>
                </div>
              </div>
              <Input label="API Key" placeholder="paste your AudienceLab API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} isMono />
              <div style={{ fontSize: 11, color: C.textMut, marginTop: -8, marginBottom: 14 }}>
                Get your key from <span style={{ color: C.accent }}>app.audiencelab.io/account</span> → API Keys → Create with "write" permission
              </div>
              <Input label="API Base URL" placeholder="https://app.audiencelab.io/api/v3" value="https://app.audiencelab.io/api/v3" onChange={() => {}} />
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn primary onClick={testConnection} disabled={testing}>
                  {testing ? "Testing…" : "Test Connection"}
                </Btn>
                <Btn
                  onClick={() => {
                    setApiKey("");
                    setConnected(false);
                    setTestResult(null);
                  }}
                >
                  Disconnect
                </Btn>
              </div>
              {testResult && (
                <div
                  style={{
                    marginTop: 14, padding: "10px 14px", borderRadius: 8,
                    background: testResult.ok ? C.greenSoft : C.redSoft,
                    border: `1px solid ${testResult.ok ? C.greenBorder : "rgba(255,77,79,0.25)"}`,
                    color: testResult.ok ? C.green : C.red,
                    fontSize: 12, fontWeight: 500,
                  }}
                >
                  {testResult.ok ? "✓ " : "✗ "}{testResult.msg}
                </div>
              )}
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
                  <div
                    style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: s.done ? C.green : C.surfaceAlt,
                      border: `2px solid ${s.done ? C.green : C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: s.done ? "#fff" : C.textMut,
                      flexShrink: 0, marginTop: 1,
                    }}
                  >
                    {s.done ? "✓" : s.step}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: s.done ? C.text : C.textSec }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: C.textMut }}>{s.desc}</div>
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
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 20 }}>
            Select which fields to include when pulling leads. These map directly to AudienceLab's field schema.
          </div>
          {Object.entries(AL_FIELDS).map(([cat, fields]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {fields.map((f) => (
                  <div
                    key={f.key}
                    onClick={() => toggleField(f.key)}
                    style={{
                      padding: "8px 14px", borderRadius: 8, cursor: "pointer", transition: "all 0.12s",
                      background: selectedFields.includes(f.key) ? C.accentGlow : C.surfaceAlt,
                      border: `1px solid ${selectedFields.includes(f.key) ? C.accentBorder : C.border}`,
                      color: selectedFields.includes(f.key) ? C.accent : C.textSec,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {selectedFields.includes(f.key) && "✓ "}
                      {f.label}
                    </div>
                    <div style={{ fontSize: 9.5, color: C.textMut, fontFamily: mono, marginTop: 2 }}>{f.key}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 10, background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSec }}>{selectedFields.length} fields selected</span>
            <span style={{ fontSize: 11, color: C.textMut, marginLeft: 12 }}>
              These will be included in every lead pull and export
            </span>
          </div>
        </div>
      )}

      {activeTab === "webhook" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Inbound Pixel Webhook</div>
            <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>
              The SuperPixel posts visitor events to this endpoint. Incoming payloads upsert /orgs/{"{orgId}"}/visitors.
            </div>
            <Input
              label="Your Webhook URL"
              placeholder="https://pride-born-ventures.vercel.app/api/webhook/pixel"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              isMono
            />
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
              Example Payload
            </div>
            <pre
              style={{
                background: C.bg, borderRadius: 8, padding: 14,
                fontFamily: mono, fontSize: 10.5, color: C.textSec,
                border: `1px solid ${C.border}`, lineHeight: 1.6,
                whiteSpace: "pre-wrap", overflowX: "auto", margin: 0,
              }}
            >
{`{
  "pixelId": "pb-7x9k2m",
  "orgId": "your-org-id",
  "path": "/pricing",
  "userAgent": "Mozilla/5.0 ...",
  "referrer": "https://google.com/...",
  "match": {
    "firstName": "Sarah",
    "lastName": "Mitchell",
    "email": "s.mitchell@gmail.com",
    "city": "Austin",
    "state": "TX"
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "pixel" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>SuperPixel Configuration</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 16 }}>
            AudienceLab V3 SuperPixel for website visitor identification. White-label ready.
          </div>
          <Input label="Pixel ID" placeholder="pb-xxxxxxxx" value="pb-7x9k2m" onChange={() => {}} isMono />
          <Input label="Whitelabel Domain" placeholder="t.yourdomain.com" value="t.prideborn.io" onChange={() => {}} isMono />
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
            Install Snippet
          </div>
          <pre
            style={{
              background: C.bg, borderRadius: 8, padding: 16,
              fontFamily: mono, fontSize: 12, color: C.textSec,
              border: `1px solid ${C.border}`, lineHeight: 1.7,
              whiteSpace: "pre-wrap", margin: "0 0 12px 0",
            }}
          >
{`<!-- Pride Born SuperPixel -->
<script src="https://t.prideborn.io/v3/px.js"
  data-id="pb-7x9k2m"
  data-webhook="/api/webhook/pixel"
  data-dedup="true" async></script>`}
          </pre>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small>Copy Snippet</Btn>
            <Btn small>Download as Tag</Btn>
          </div>
        </div>
      )}

      {activeTab === "dev" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, maxWidth: 640 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Dev Tools</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
            Seed sample leads, visitors, and deals into your workspace so you can exercise the
            Leads table, CRM Kanban, and Pixel feed without a live AudienceLab connection. Runs
            only against the Firebase emulator (or with <code style={{ fontFamily: mono, background: C.surfaceAlt, padding: "1px 5px", borderRadius: 4 }}>ALLOW_DEV_SEED=1</code>).
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary onClick={() => seed("POST")} disabled={seeding}>
              {seeding ? "Working…" : "Seed sample data"}
            </Btn>
            <Btn onClick={() => seed("DELETE")} disabled={seeding}>
              Clear workspace data
            </Btn>
          </div>
          {seedStatus && (
            <div
              style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 8,
                background: seedStatus.ok ? C.greenSoft : C.redSoft,
                border: `1px solid ${seedStatus.ok ? C.greenBorder : "rgba(255,77,79,0.25)"}`,
                color: seedStatus.ok ? C.green : C.red,
                fontSize: 12, fontWeight: 500,
              }}
            >
              {seedStatus.ok ? "✓ " : "✗ "}{seedStatus.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
