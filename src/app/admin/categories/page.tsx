import Link from "next/link";
import {requireAdmin} from "@/lib/admin-auth";
import CategoriesClient from "./categories-client";
export const dynamic="force-dynamic";
export default async function CategoriesPage(){
 try{await requireAdmin("editor");}catch{return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><Link href="/admin/login">تسجيل الدخول</Link></section></main>;}
 return <main className="admin-shell" dir="rtl"><section className="admin-main" style={{width:"min(1100px,100%)",margin:"0 auto"}}><header className="admin-heading"><div><p className="admin-eyebrow">PLAYNOVA CATALOG</p><h1>إدارة التصنيفات</h1><p>أنشئ التصنيفات ورتب ظهورها دون حذف التصنيفات المرتبطة بالألعاب.</p></div><Link className="admin-secondary" href="/admin">العودة للوحة</Link></header><CategoriesClient/></section></main>;
}
