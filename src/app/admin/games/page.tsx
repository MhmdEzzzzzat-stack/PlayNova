import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlayNovaDb } from "@/lib/db";
import GamesAdminClient from "./games-client";
export const dynamic="force-dynamic";
export default async function AdminGamesPage(){
 let actor;try{actor=await requireAdmin("editor");}catch{return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>;}
 const db=await getPlayNovaDb();
 const categories=await db.prepare("SELECT id,name_ar,name_en FROM categories ORDER BY sort_order,name_ar").all<{id:string;name_ar:string;name_en:string}>();
 return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1200px,100%)",margin:"0 auto"}}>
 <header className="admin-heading"><div><p className="admin-eyebrow">PLAYNOVA CATALOG</p><h1>إدارة الألعاب</h1><p>إضافة الألعاب وتحديث بياناتها وحالتها. النشر مقيد بإثبات الحقوق.</p></div><Link className="admin-secondary" href="/admin">العودة للوحة</Link></header>
 <GamesAdminClient categories={categories.results} canPublish={actor.role==="owner"||actor.role==="administrator"}/>
 </section></main>;
}
