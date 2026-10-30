import { requireAdmin } from "@/lib/admin-auth";
import AdminUsersClient from "./users-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  try { await requireAdmin("administrator"); }
  catch { return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>; }
  return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1100px,100%)",margin:"0 auto"}}>
    <header className="admin-heading"><div><p className="admin-eyebrow">PLAYNOVA ACCESS CONTROL</p><h1>إدارة المشرفين</h1><p>إنشاء الحسابات وتحديد الأدوار وتعطيل الوصول.</p></div><Link className="admin-secondary" href="/admin">العودة للوحة</Link></header>
    <AdminUsersClient />
  </section></main>;
}
