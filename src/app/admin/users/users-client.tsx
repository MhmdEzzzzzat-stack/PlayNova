"use client";
import { useEffect, useState, type FormEvent } from "react";

type Role = "owner"|"administrator"|"editor"|"reviewer";
type User = {email:string;role:Role;active:number;created_at:string;updated_at:string};
const roleNames:Record<Role,string> = {owner:"مالك",administrator:"مدير",editor:"محرر",reviewer:"مراجع"};

export default function AdminUsersClient() {
 const [users,setUsers]=useState<User[]>([]);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [role,setRole]=useState<Role>("editor");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 async function load(){const r=await fetch("/api/admin/users",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تحميل الحسابات");setUsers(d.users);}
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 async function create(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,role})});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر إنشاء الحساب");setEmail("");setPassword("");setNotice("تم إنشاء الحساب. أرسل بيانات الدخول للمستخدم بطريقة آمنة.");await load();}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setBusy(false);}}
 async function update(user:User,patch:{active?:boolean;role?:Role}){setError("");setNotice("");try{const r=await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:user.email,...patch})});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تحديث الحساب");setNotice("تم تحديث الحساب.");await load();}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}}
 return <div style={{display:"grid",gap:22}}>
  <section className="admin-card"><h2 style={{fontSize:19,fontWeight:800}}>إضافة مشرف</h2><form onSubmit={create} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginTop:16}}>
   <input required type="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} style={field}/>
   <input required type="password" minLength={12} maxLength={128} placeholder="كلمة مرور مؤقتة (12+)" value={password} onChange={e=>setPassword(e.target.value)} style={field}/>
   <select value={role} onChange={e=>setRole(e.target.value as Role)} style={field}><option value="editor">محرر</option><option value="reviewer">مراجع</option><option value="administrator">مدير</option><option value="owner">مالك</option></select>
   <button disabled={busy} type="submit" className="admin-secondary">{busy?"جارٍ الإنشاء...":"إنشاء الحساب"}</button>
  </form><p style={{color:"#aaa5c3",fontSize:12,marginTop:10}}>كلمات المرور لا تُعرض بعد الحفظ. شارك كلمة المرور المؤقتة عبر قناة آمنة واطلب تغييرها خارج النظام قبل الاستخدام الفعلي.</p></section>
  <section className="admin-card"><h2 style={{fontSize:19,fontWeight:800,marginBottom:16}}>الحسابات الحالية</h2>{users.length===0?<p className="admin-empty">لا توجد حسابات للعرض.</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>البريد</th><th>الدور</th><th>الحالة</th><th>تغيير الدور</th><th>إجراء</th></tr></thead><tbody>{users.map(u=><tr key={u.email}><td>{u.email}</td><td>{roleNames[u.role]}</td><td>{u.active?"نشط":"معطل"}</td><td><select value={u.role} onChange={e=>update(u,{role:e.target.value as Role})} style={field}><option value="editor">محرر</option><option value="reviewer">مراجع</option><option value="administrator">مدير</option><option value="owner">مالك</option></select></td><td><button type="button" className="admin-secondary" onClick={()=>update(u,{active:!u.active})}>{u.active?"تعطيل":"تفعيل"}</button></td></tr>)}</tbody></table></div>}</section>
  {error&&<p role="alert" style={{color:"#fca5a5"}}>{error}</p>}{notice&&<p role="status" style={{color:"#86efac"}}>{notice}</p>}
 </div>;
}
const field={minHeight:42,border:"1px solid rgba(196,181,253,.2)",borderRadius:10,background:"#17132a",padding:"0 11px",color:"white",width:"100%"};
