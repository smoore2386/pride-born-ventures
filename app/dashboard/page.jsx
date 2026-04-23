"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, font } from "../theme";
import { useAuth } from "../../lib/hooks/useAuth";
import Sidebar from "./_views/Sidebar";
import DashboardView from "./_views/DashboardView";
import AudienceView from "./_views/AudienceView";
import LeadsView from "./_views/LeadsView";
import PixelView from "./_views/PixelView";
import CampaignsView from "./_views/CampaignsView";
import CRMView from "./_views/CRMView";
import AdsView from "./_views/AdsView";
import SettingsView from "./_views/SettingsView";

export default function App() {
  const router = useRouter();
  const { user, userDoc, loading, signOut } = useAuth();
  const [view, setView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://pride-born-ventures.vercel.app/api/webhook/pixel");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login?next=/dashboard"); return; }
    if (user && userDoc && !userDoc.defaultOrgId) { router.replace("/onboarding"); }
  }, [loading, user, userDoc, router]);

  const views = {
    dashboard: <DashboardView connected={connected} />,
    audience:  <AudienceView />,
    leads:     <LeadsView />,
    pixel:     <PixelView />,
    campaigns: <CampaignsView />,
    crm:       <CRMView />,
    ads:       <AdsView />,
    settings: (
      <SettingsView
        apiKey={apiKey} setApiKey={setApiKey}
        webhookUrl={webhookUrl} setWebhookUrl={setWebhookUrl}
        connected={connected} setConnected={setConnected}
      />
    ),
  };

  if (loading || !user || !userDoc?.defaultOrgId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, color: C.textSec, fontFamily: font, fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  const initials = ((user.displayName || user.email || "??").match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: font, color: C.text, overflow: "hidden" }}>
      <Sidebar active={view} setActive={setView} collapsed={collapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: "none", border: "none", color: C.textMut, fontSize: 16, cursor: "pointer", padding: "4px 6px" }}
            >
              ☰
            </button>
            <Link
              href="/"
              style={{ fontSize: 11, fontWeight: 600, color: C.textMut, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}
            >
              ← Site
            </Link>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Search leads, audiences, campaigns..."
                style={{ width: 300, padding: "7px 12px 7px 32px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 12.5, outline: "none", fontFamily: font }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.textMut }}>⌕</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 7, background: connected ? C.greenSoft : C.amberSoft, border: `1px solid ${connected ? C.greenBorder : C.amberBorder}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? C.green : C.amber }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: connected ? C.green : C.amber }}>
                {connected ? "API Live" : "API Offline"}
              </span>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              style={{ background: "none", border: "none", color: C.textMut, fontSize: 11, cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
            >
              Sign out
            </button>
            <div
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10.5, fontWeight: 800, color: "#fff", cursor: "pointer",
              }}
              title={user.email}
            >
              {initials}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>{views[view]}</div>
      </div>
    </div>
  );
}
