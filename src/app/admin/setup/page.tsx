"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, secret }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "تعذر إنشاء حساب المالك.");
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع.");
    } finally {
      setBusy(false);
      setSecret("");
    }
  }

  return (
    <main className="admin-shell" dir="rtl">
      <section className="admin-card" style={{ width: "min(480px, calc(100% - 32px))", margin: "auto" }}>
        <h1 style={{ fontSize: 25, fontWeight: 900 }}>تهيئة حساب المالك الأول</h1>
        <p style={{ marginTop: 10, color: "#aaa5c3", fontSize: 13, lineHeight: 1.9 }}>
          استخدم هذا النموذج مرة واحدة فقط بعد إعداد ADMIN_BOOTSTRAP_EMAIL و ADMIN_BOOTSTRAP_SECRET في بيئة Cloudflare.
          إذا تم إنشاء مالك بالفعل فلن يسمح النظام بإنشاء مالك آخر.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 22 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#c4b5fd" }}>بريد المالك
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" style={{ minHeight: 44, borderRadius: 10, background: "#17132a", padding: "0 12px", color: "white" }} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#c4b5fd" }}>كلمة مرور قوية (12 حرفًا على الأقل)
            <input required minLength={12} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" style={{ minHeight: 44, borderRadius: 10, background: "#17132a", padding: "0 12px", color: "white" }} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#c4b5fd" }}>مفتاح التهيئة السري
            <input required type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="off" style={{ minHeight: 44, borderRadius: 10, background: "#17132a", padding: "0 12px", color: "white" }} />
          </label>
          {error && <p role="alert" style={{ color: "#fca5a5", fontSize: 12 }}>{error}</p>}
          <button disabled={busy} type="submit" style={{ minHeight: 44, borderRadius: 10, background: "#7c3aed", color: "white", fontWeight: 800, opacity: busy ? .6 : 1 }}>{busy ? "جارٍ إنشاء الحساب..." : "إنشاء حساب المالك"}</button>
        </form>
      </section>
    </main>
  );
}
