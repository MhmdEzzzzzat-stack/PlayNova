"use client";
import {useState} from "react";
export default function AnalyticsRetentionButton(){const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
async function run(){if(!confirm("حذف أحداث التحليلات الأقدم من 90 يومًا؟ هذا الإجراء لا يمكن التراجع عنه."))return;setBusy(true);setMessage("");try{const r=await fetch("/api/admin/analytics/retention",{method:"POST"}),d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تنفيذ التنظيف.");setMessage("تم حذف "+d.deleted+" حدث قديم.");}catch(e){setMessage(e instanceof Error?e.message:"حدث خطأ.");}finally{setBusy(false);}}
return <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:14}}><button className="admin-secondary" disabled={busy} onClick={run}>{busy?"جارٍ التنظيف...":"تنظيف بيانات أقدم من 90 يومًا"}</button><small>{message}</small></div>}
