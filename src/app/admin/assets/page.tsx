import Link from "next/link";
import {requireAdmin} from "@/lib/admin-auth";
import AssetsClient from "./assets-client";
export const dynamic="force-dynamic";
export default async function AssetsPage(){
 try{await requireAdmin("reviewer");}catch{return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>;}
 return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1200px,100%)",margin:"0 auto"}}><header className="admin-heading"><div><p className="admin-eyebrow">PLAYNOVA ASSET VAULT</p><h1>رفع الملفات ومراجعتها</h1><p>الملفات تبقى في منطقة حجر حتى اعتمادها. حزم الألعاب لا يتم تشغيلها من نطاق التطبيق.</p></div><Link href="/admin" className="admin-secondary">العودة للوحة</Link></header><AssetsClient/></section></main>;
}
