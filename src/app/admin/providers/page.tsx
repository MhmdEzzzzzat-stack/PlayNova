import Link from "next/link";
import {requireAdmin} from "@/lib/admin-auth";
import ProvidersClient from "./providers-client";
export const dynamic="force-dynamic";
export default async function ProvidersPage(){try{await requireAdmin("administrator");}catch{return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>;}return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1000px,100%)",margin:"0 auto"}}><header className="admin-heading"><div><p className="admin-eyebrow">TRUSTED PROVIDERS</p><h1>مزودو الألعاب المعتمدون</h1><p>يسمح هذا السجل بنطاقات HTTPS محددة فقط لتشغيل ألعاب الطرف الثالث.</p></div><Link href="/admin" className="admin-secondary">العودة للوحة</Link></header><ProvidersClient/></section></main>;}
