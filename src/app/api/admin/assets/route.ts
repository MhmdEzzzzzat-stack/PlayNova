import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";
const no=(message="غير مصرح لك.")=>NextResponse.json({error:message},{status:403});
const bad=(message:string)=>NextResponse.json({error:message},{status:400});
const sameOrigin=(r:NextRequest)=>{try{const o=r.headers.get("origin");return !!o&&new URL(o).origin===new URL(r.url).origin;}catch{return false;}};
export async function GET(){
 try{await requireAdmin("reviewer");}catch{return no();}
 const db=await getPlayNovaDb();
 const rows=await db.prepare("SELECT a.*,g.slug AS game_slug,g.title_ar AS game_title FROM content_assets a LEFT JOIN games g ON g.id=a.game_id WHERE a.status!='removed' ORDER BY a.created_at DESC LIMIT 200").all();
 const usage=await db.prepare("SELECT COALESCE(SUM(size_bytes),0) AS bytes,COUNT(*) AS count FROM content_assets WHERE status!='removed'").first<{bytes:number;count:number}>();
 return NextResponse.json({assets:rows.results,usage},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return no();
 try{await requireAdmin("editor");}catch{return no();}
 return NextResponse.json({error:"رفع الملفات غير متاح مؤقتًا حتى إعداد خدمة تخزين بدون بطاقة دفع."},{status:503});
}
export async function PATCH(request:NextRequest){
 if(!sameOrigin(request))return no();
 let actor;try{actor=await requireAdmin("reviewer");}catch{return no();}
 let body:{id?:unknown;decision?:unknown;notes?:unknown};try{body=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const id=typeof body.id==="string"?body.id.slice(0,80):"";
 if(!id||body.decision!=="reject")return bad("المتاح مؤقتًا هو رفض الملفات الموجودة فقط.");
 const db=await getPlayNovaDb();
 const asset=await db.prepare("SELECT id,status FROM content_assets WHERE id=?").bind(id).first<{id:string;status:string}>();
 if(!asset||asset.status==="removed")return NextResponse.json({error:"الملف غير موجود."},{status:404});
 const notes=typeof body.notes==="string"?body.notes.slice(0,2000):"";
 await db.prepare("UPDATE content_assets SET status='rejected',review_notes=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(notes,actor.email,id).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'asset_rejected','asset',?,?)").bind(actor.email,actor.role,id,JSON.stringify({notes})).run();
 return NextResponse.json({ok:true,status:"rejected"});
}
export async function DELETE(request:NextRequest){
 if(!sameOrigin(request))return no();
 try{await requireAdmin("administrator");}catch{return no();}
 return NextResponse.json({error:"حذف الملفات غير متاح مؤقتًا حتى إعداد خدمة التخزين."},{status:503});
}
