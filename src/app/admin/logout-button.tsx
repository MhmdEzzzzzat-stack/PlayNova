"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setBusy(false);
    }
  }
  return <button type="button" onClick={logout} disabled={busy} className="admin-secondary">{busy ? "جارٍ الخروج..." : "تسجيل الخروج"}</button>;
}
