"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import AuthShell from "../components/AuthShell";
import { getClientAuth } from "../../lib/firebase/client";
import { C } from "../theme";

async function establishSession(user) {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to establish session");
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleEmailLogin(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(getClientAuth(), email, password);
      await establishSession(user);
      router.push("/dashboard");
    } catch (e2) {
      setErr(e2.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setErr(null);
    setLoading(true);
    try {
      const { user } = await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
      await establishSession(user);
      router.push("/dashboard");
    } catch (e2) {
      setErr(e2.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Pride Born dashboard."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" style={{ color: C.accent, fontWeight: 600 }}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleEmailLogin} style={{ display: "grid", gap: 12 }}>
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 18px",
            borderRadius: 10,
            background: C.accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: 6,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Divider />
      <button
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 18px",
          borderRadius: 10,
          background: "transparent",
          color: C.text,
          fontSize: 14,
          fontWeight: 600,
          border: `1px solid ${C.border}`,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        Continue with Google
      </button>
      {err && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 8,
            background: C.redSoft,
            border: `1px solid rgba(255,77,79,0.25)`,
            color: C.red,
            fontSize: 12.5,
          }}
        >
          {err}
        </div>
      )}
    </AuthShell>
  );
}

function Field({ label, type, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.textMut,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          padding: "11px 14px",
          borderRadius: 9,
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          color: C.text,
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "18px 0",
        color: C.textMut,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}
    >
      <div style={{ flex: 1, height: 1, background: C.border }} />
      or
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}
