"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell" dir="rtl">
      <section className="admin-card" style={{ width: "min(440px, calc(100% - 32px))", margin: "auto" }}>
        <Link href="/" className="admin-brand">Play<span>Nova</span></Link>
        <h1 style={{ marginTop: 24, fontSize: 26, fontWeight: 900 }}>تسجيل دخول الإدارة</h1>
        <p style={{ marginTop: 8, color: "#aaa5c3", fontSize: 13 }}>استخدم حساب الإدارة المعتمد للوصول إلى لوحة التحكم.</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#c4b5fd" }}>
            البريد الإلكتروني
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} style={{ minHeight: 44, border: "1px solid rgba(196,181,253,.2)", borderRadius: 10, background: "#17132a", padding: "0 12px", color: "white" }} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#c4b5fd" }}>
            كلمة المرور
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ minHeight: 44, border: "1px solid rgba(196,181,253,.2)", borderRadius: 10, background: "#17132a", padding: "0 12px", color: "white" }} />
          </label>
          {error && <p role="alert" style={{ color: "#fca5a5", fontSize: 12 }}>{error}</p>}
          <button disabled={busy} type="submit" style={{ minHeight: 44, borderRadius: 10, background: "#7c3aed", color: "white", fontWeight: 800, opacity: busy ? .6 : 1 }}>{busy ? "جارٍ التحقق..." : "تسجيل الدخول"}</button>
        </form>
      </section>
    </main>
  );
}
