import {NextRequest,NextResponse} from "next/server";
import {getCloudflareContext} from "@opennextjs/cloudflare";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";
import {inspectAsset,type AssetKind} from "@/lib/asset-validation";
type Bucket={put:(key:string,value:ArrayBuffer,options?:{httpMetadata?:{contentType:string};customMetadata?:Record<string,string>})=>Promise<unknown>;delete:(key:string)=>Promise<void>};
async function bucket(){const {env}=await getCloudflareContext({async:true});const b=(env as unknown as {ASSETS_BUCKET?:Bucket}).ASSETS_BUCKET;if(!b)throw new Error("R2 binding ASSETS_BUCKET is not configured.");return b;}
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
 const contentLength=Number(request.headers.get("content-length")||0);if(contentLength>51*1024*1024)return bad("حجم الطلب يتجاوز الحد الأقصى.");
 let actor;try{actor=await requireAdmin("editor");}catch{return no();}
 let form:FormData;try{form=await request.formData();}catch{return bad("تعذر قراءة نموذج الرفع.");}
 const file=form.get("file"),gameId=String(form.get("gameId")||"").trim(),kind=String(form.get("kind")||"");
 if(!(file instanceof File)||!["thumbnail","screenshot","html5_package"].includes(kind))return bad("اختر ملفًا ونوع أصل صالحًا.");
 if(kind==="html5_package"&&actor.role!=="owner"&&actor.role!=="administrator")return no("رفع حزم HTML5 متاح للمالك أو المدير فقط.");
 const max=kind==="html5_package"?50*1024*1024:8*1024*1024;
 if(file.size<1||file.size>max)return bad("حجم الملف غير مسموح.");
 const db=await getPlayNovaDb();
 if(gameId){const game=await db.prepare("SELECT id FROM games WHERE id=?").bind(gameId).first();if(!game)return bad("اللعبة المحددة غير موجودة.");}
 if(kind==="html5_package"&&!gameId)return bad("يجب ربط حزمة HTML5 بلعبة موجودة.");
 const bytes=new Uint8Array(await file.arrayBuffer());
 let inspected;try{inspected=inspectAsset(bytes,kind as AssetKind,file.type,file.name);}catch(e){return bad(e instanceof Error?e.message:"الملف غير صالح.");}
 const sha=await digest(bytes);
 const duplicate=await db.prepare("SELECT id,status FROM content_assets WHERE sha256=? AND size_bytes=? AND asset_type=? AND game_id IS ? AND status!='removed' LIMIT 1").bind(sha,bytes.byteLength,kind,gameId||null).first<{id:string;status:string}>();
 if(duplicate)return NextResponse.json({ok:true,duplicate:true,id:duplicate.id,status:duplicate.status});
 const id=crypto.randomUUID(),key="staging/"+id+"/"+safeName(file.name),now=new Date().toISOString();
 let store;try{store=await bucket();await store.put(key,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,{httpMetadata:{contentType:inspected.contentType},customMetadata:{assetId:id,sha256:sha,kind,review:"pending"}});}catch(e){return NextResponse.json({error:"فشل رفع الملف إلى التخزين. تحقق من إعداد R2 وحاول مرة أخرى.",detail:e instanceof Error?e.message:""},{status:503});}
 try{
 await db.prepare("INSERT INTO content_assets(id,game_id,asset_type,storage_key,original_filename,content_type,file_extension,size_bytes,sha256,status,uploaded_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'pending_review',?,?,?)")
 .bind(id,gameId||null,kind,key,safeName(file.name),inspected.contentType,inspected.extension,bytes.byteLength,sha,actor.email,now,now).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'asset_uploaded','asset',?,?)").bind(actor.email,actor.role,id,JSON.stringify({kind,size:bytes.byteLength,sha256:sha,zipEntries:inspected.entries,expandedBytes:inspected.expandedBytes})).run();
 return NextResponse.json({ok:true,id,status:"pending_review",size:bytes.byteLength,sha256:sha},{status:201});
 }catch(e){try{await db.prepare("DELETE FROM content_assets WHERE id=?").bind(id).run();}catch{}try{await store.delete(key);}catch{}return NextResponse.json({error:"تعذر حفظ سجل الملف؛ تمت محاولة تنظيف الملف المرفوع.",detail:e instanceof Error?e.message:""},{status:500});}
}
export async function PATCH(request:NextRequest){
 if(!sameOrigin(request))return no();
 let actor;try{actor=await requireAdmin("reviewer");}catch{return no();}
 let body:{id?:unknown;decision?:unknown;notes?:unknown};try{body=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const id=typeof body.id==="string"?body.id.slice(0,80):"",decision=body.decision;
 if(!id||!["approve","reject"].includes(String(decision)))return bad("حدد الملف وقرار المراجعة.");
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
 let actor;try{actor=await requireAdmin("administrator");}catch{return no();}
 let body:{id?:unknown;cleanup?:unknown};try{body=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const db=await getPlayNovaDb(),store=await bucket();
 if(body.cleanup===true){
  const old=await db.prepare("SELECT id,storage_key FROM content_assets WHERE game_id IS NULL AND status IN ('pending_review','rejected') AND created_at < datetime('now','-30 days') LIMIT 100").all<{id:string;storage_key:string}>();
  let removed=0;for(const item of old.results){await store.delete(item.storage_key);await db.prepare("UPDATE content_assets SET status='removed',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(item.id).run();removed++;}
  await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,details_json) VALUES(?,?, 'orphan_assets_cleanup','asset',?)").bind(actor.email,actor.role,JSON.stringify({removed})).run();
  return NextResponse.json({ok:true,removed});
 }
 const id=typeof body.id==="string"?body.id.slice(0,80):"";if(!id)return bad("معرّف الملف مطلوب.");
 const asset=await db.prepare("SELECT id,storage_key,status FROM content_assets WHERE id=?").bind(id).first<{id:string;storage_key:string;status:string}>();
 if(!asset)return NextResponse.json({error:"الملف غير موجود."},{status:404});
 if(asset.status==="published")return bad("لا يمكن حذف ملف منشور من هنا؛ أوقف نشره أولًا.");
 try{await store.delete(asset.storage_key);}catch{return NextResponse.json({error:"تعذر حذف الملف من R2؛ لم يتم تغيير السجل."},{status:503});}
 await db.prepare("UPDATE content_assets SET status='removed',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();
 await db.prepare("UPDATE games SET thumbnail_url=NULL,updated_at=CURRENT_TIMESTAMP WHERE thumbnail_url=?").bind("/api/assets/"+id).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id) VALUES(?,?, 'asset_removed','asset',?)").bind(actor.email,actor.role,id).run();
 return NextResponse.json({ok:true});
}
