"use client";

import { C, font, mono } from "../../theme";

export const Badge = ({ children, color, bg, border }) => (
  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: bg, color, border: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{children}</span>
);

export const StatusBadge = ({ status }) => {
  const m = {
    new:        [C.accent, C.accentGlow, C.accentBorder],
    contacted:  [C.amber,  C.amberSoft,  C.amberBorder],
    qualified:  [C.purple, C.purpleSoft, C.purple + "55"],
    closed:     [C.green,  C.greenSoft,  C.greenBorder],
    closed_won: [C.green,  C.greenSoft,  C.greenBorder],
    closed_lost:[C.red,    C.redSoft,    "rgba(255,77,79,0.25)"],
  };
  const [c, bg, b] = m[status] || m.new;
  return <Badge color={c} bg={bg} border={b}>{status.replace("_"," ")}</Badge>;
};

export const Metric = ({ label, value, change, icon, color = C.accent }) => (
  <div
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 160, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = color + "66")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
  >
    <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: color, opacity: 0.04 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{value}</div>
    {change != null && (
      <div style={{ fontSize: 11, color: change >= 0 ? C.green : C.red, marginTop: 4, fontWeight: 600 }}>
        {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last week
      </div>
    )}
  </div>
);

export const Btn = ({ children, primary, small, onClick, disabled, style: s = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: small ? "6px 14px" : "10px 20px",
      borderRadius: small ? 8 : 10,
      background: primary ? C.accent : "transparent",
      color: primary ? "#fff" : C.textSec,
      border: primary ? "none" : `1px solid ${C.border}`,
      fontSize: small ? 11 : 13,
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: font,
      transition: "all 0.15s",
      opacity: disabled ? 0.6 : 1,
      ...s,
    }}
  >
    {children}
  </button>
);

export const Input = ({ label, placeholder, value, onChange, type = "text", isMono }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ fontSize: 10, fontWeight: 700, color: C.textMut, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: isMono ? mono : font, transition: "border-color 0.15s" }}
      onFocus={(e) => (e.target.style.borderColor = C.accent + "66")}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  </div>
);

export const Spark = ({ data, color, h = 36 }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data),
    min = Math.min(...data),
    r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - ((v - min) / r) * (h - 4) - 2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#g${color.slice(1)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 2, background: C.card, borderRadius: 10, padding: 3, width: "fit-content", border: `1px solid ${C.border}`, marginBottom: 20 }}>
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: "7px 18px",
          borderRadius: 8,
          border: "none",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          background: active === t.id ? C.accent : "transparent",
          color: active === t.id ? "#fff" : C.textMut,
          fontFamily: font,
          transition: "all 0.15s",
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export const Empty = ({ icon = "✨", title, body, action }) => (
  <div
    style={{
      padding: "60px 30px",
      textAlign: "center",
      background: C.card,
      border: `1px dashed ${C.border}`,
      borderRadius: 14,
      color: C.textSec,
    }}
  >
    <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>{title}</h3>
    {body && <p style={{ fontSize: 13, color: C.textMut, margin: "0 0 18px", lineHeight: 1.55 }}>{body}</p>}
    {action}
  </div>
);
