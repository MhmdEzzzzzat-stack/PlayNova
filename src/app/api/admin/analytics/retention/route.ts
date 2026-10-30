import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";
export async function POST(request:NextRequest){
 try{const origin=request.headers.get("origin");if(!origin||new URL(origin).origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin."},{status:403});}catch{return NextResponse.json({error:"Invalid origin."},{status:403});}
 let actor;try{actor=await requireAdmin("administrator");}catch{return NextResponse.json({error:"Forbidden."},{status:403});}
 const db=await getPlayNovaDb();
 const before=await db.prepare("SELECT COUNT(*) AS count FROM analytics_events WHERE created_at < datetime('now','-90 days')").first<{count:number}>();
 await db.prepare("DELETE FROM analytics_events WHERE created_at < datetime('now','-90 days')").run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,details_json) VALUES(?,?, 'analytics_retention_cleanup','analytics',?)").bind(actor.email,actor.role,JSON.stringify({deleted:before?.count||0,retentionDays:90})).run();
 return NextResponse.json({ok:true,deleted:before?.count||0,retentionDays:90},{headers:{"Cache-Control":"no-store"}});
}
