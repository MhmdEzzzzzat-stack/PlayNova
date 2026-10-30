import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";
import type {AssetKind} from "@/lib/asset-validation";
const no=(message="غير مصرح لك.")=>NextResponse.json({error:message},{status:403});
const bad=(message:string)=>NextResponse.json({error:message},{status:400});
const sameOrigin=(r:NextRequest)=>{try{const o=r.headers.get("origin");return !!o&&new URL(o).origin===new URL(r.url).origin;}catch{return false;}};
async function digest(bytes:Uint8Array){const buffer=new ArrayBuffer(bytes.byteLength);new Uint8Array(buffer).set(bytes);const hash=await crypto.subtle.digest("SHA-256",buffer);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function safeName(name:string){return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100)||"upload";}
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
 const id=typeof body.id==="string"?body.id.slice(0,80):"",decision=body.decision;
 if(!id||!["approve","reject"].includes(String(decision)))return bad("حدد الملف وقرار المراجعة.");
 if(decision==="approve")return NextResponse.json({error:"اعتماد الملفات غير متاح مؤقتًا حتى إعداد خدمة التخزين."},{status:503});
 const db=await getPlayNovaDb();
 const asset=await db.prepare("SELECT id,game_id,asset_type,status FROM content_assets WHERE id=?").bind(id).first<{id:string;game_id:string|null;asset_type:AssetKind;status:string}>();
 if(!asset||asset.status==="removed")return NextResponse.json({error:"الملف غير موجود."},{status:404});
 if(decision==="approve"&&asset.asset_type==="html5_package"){
  if(actor.role!=="owner"&&actor.role!=="administrator")return no("اعتماد حزم الألعاب يتطلب المالك أو المدير.");
  const game=await db.prepare("SELECT license_status,authorization_reference,rights_evidence_url FROM games WHERE id=?").bind(asset.game_id).first<{license_status:string;authorization_reference:string;rights_evidence_url:string}>();
  if(!game||game.license_status!=="approved"||!game.authorization_reference?.trim()||!/^https:\/\//i.test(game.rights_evidence_url||""))return bad("لا يمكن اعتماد حزمة لعبة قبل اعتماد الترخيص وإضافة مرجع التفويض وإثبات HTTPS.");
 }
 const status=decision==="approve"?"approved":"rejected",notes=typeof body.notes==="string"?body.notes.slice(0,2000):"";
 await db.prepare("UPDATE content_assets SET status=?,review_notes=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,notes,actor.email,id).run();
 if(status==="approved"&&asset.asset_type==="thumbnail"&&asset.game_id)await db.prepare("UPDATE games SET thumbnail_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind("/api/assets/"+id,asset.game_id).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, ?, 'asset',?,?)").bind(actor.email,actor.role,"asset_"+status,id,JSON.stringify({notes})).run();
 return NextResponse.json({ok:true,status});
}
export async function DELETE(request:NextRequest){
 if(!sameOrigin(request))return no();
 try{await requireAdmin("administrator");}catch{return no();}
 return NextResponse.json({error:"حذف الملفات غير متاح مؤقتًا حتى إعداد خدمة التخزين."},{status:503});
}
