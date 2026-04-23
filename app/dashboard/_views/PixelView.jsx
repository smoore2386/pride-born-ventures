"use client";

import { orderBy, limit } from "firebase/firestore";
import { C } from "../../theme";
import { useAuth } from "../../../lib/hooks/useAuth";
import { useFirestoreCollection } from "../../../lib/hooks/useFirestore";
import { Badge, Metric, Empty, Btn } from "./ui";

function tsToDate(v) {
  if (!v) return null;
  if (typeof v === "object" && v.seconds != null) return new Date(v.seconds * 1000);
  if (v instanceof Date) return v;
  return null;
}

function relativeTime(d) {
  if (!d) return "—";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function PixelView() {
  const { orgId } = useAuth();
  const { data: visitors, loading } = useFirestoreCollection(
    orgId ? `orgs/${orgId}/visitors` : null,
    [orderBy("lastSeenAt", "desc"), limit(50)]
  );

  const matched = visitors.filter((v) => v.matched).length;
  const rate = visitors.length ? Math.round((matched / visitors.length) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Visitor Tracking</h2>
        <p style={{ fontSize: 13, color: C.textMut, margin: "4px 0 0" }}>
          AudienceLab V3 SuperPixel — identify anonymous website visitors
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Metric label="Visitors" value={visitors.length} icon="👁️" color={C.accent} />
        <Metric label="Identified" value={matched} icon="🎯" color={C.green} />
        <Metric label="Match Rate" value={`${rate}%`} icon="📊" color={C.purple} />
      </div>

      {!loading && visitors.length === 0 ? (
        <Empty
          title="No visitors captured yet"
          body="Install the pixel snippet in Settings → Pixel Config and paste it on your site. Matches start flowing in within minutes of the first visit."
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
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Live Visitors</span>
            <Badge color={C.green} bg={C.greenSoft} border={C.greenBorder}>● Live</Badge>
          </div>
          {visitors.map((v, i) => {
            const seen = tsToDate(v.lastSeenAt) || tsToDate(v.firstSeenAt);
            return (
              <div
                key={v.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.5fr 0.8fr 0.8fr 1fr 80px",
                  padding: "11px 18px",
                  borderBottom: i < visitors.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{v.landingPath || "/"}</div>
                <div style={{ fontSize: 11, color: C.textMut }}>{v.pages || 1} views</div>
                <div style={{ fontSize: 11, color: C.textMut }}>{relativeTime(seen)}</div>
                <div style={{ fontSize: 11, color: C.textSec }}>{v.userAgent || "—"}</div>
                <div style={{ fontSize: 11, color: C.textSec }}>
                  {v.matched && v.matchedName ? (
                    <span style={{ color: C.green, fontWeight: 500 }}>
                      {v.matchedName}{v.city ? ` · ${v.city}, ${v.state}` : ""}
                    </span>
                  ) : (
                    v.city ? `${v.city}, ${v.state}` : "—"
                  )}
                </div>
                <div>
                  <Badge
                    color={v.matched ? C.green : C.textMut}
                    bg={v.matched ? C.greenSoft : C.surfaceAlt}
                    border={v.matched ? C.greenBorder : C.border}
                  >
                    {v.matched ? "Matched" : "Unknown"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
