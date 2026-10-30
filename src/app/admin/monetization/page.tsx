import Link from "next/link";
import {requireAdmin} from "@/lib/admin-auth";
import MonetizationClient from "./monetization-client";
export const dynamic="force-dynamic";
export default async function MonetizationPage(){
 try{await requireAdmin("administrator");}catch{return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>;}
 return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1100px,100%)",margin:"0 auto"}}><header className="admin-heading"><div><p className="admin-eyebrow">PLAYNOVA REVENUE CONTROL</p><h1>تحقيق الأرباح والإعلانات</h1><p>كل الوحدات متوقفة افتراضيًا. لا تُحمّل أي مكتبة إعلانية قبل الاعتماد والإعداد.</p></div><Link href="/admin" className="admin-secondary">العودة للوحة</Link></header><MonetizationClient/></section></main>;
}
