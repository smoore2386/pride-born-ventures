"use client";

import Link from "next/link";
import { useState } from "react";
import { C } from "../theme";

export default function Nav({ active }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/industries", label: "Industries" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(6,11,20,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 13,
              color: "#fff",
            }}
          >
            PB
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.2px" }}>
            Pride Born
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          className="pb-nav-links"
        >
          {links.map((l) => {
            const isActive = active === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive ? C.text : C.textSec,
                  background: isActive ? C.card : "transparent",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/dashboard"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: C.textSec,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              background: C.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(45,127,249,0.25)",
            }}
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
