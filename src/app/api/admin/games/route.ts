import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AdminRole } from "@/lib/admin-auth";
import { getPlayNovaDb } from "@/lib/db";

type GameStatus = "draft" | "published" | "archived";
type LicenseStatus = "pending" | "approved" | "rejected" | "expired";
const rolesCanEdit: AdminRole[] = ["owner","administrator","editor"];
const rolesCanPublish: AdminRole[] = ["owner","administrator"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const safeUrl = (v: unknown) => typeof v === "string" && v.length <= 2048 && /^https:\/\//i.test(v);
const sameOrigin = (r:NextRequest) => { try { const o=r.headers.get("origin"); return !!o && new URL(o).origin===new URL(r.url).origin; } catch { return false; } };
const denied=()=>NextResponse.json({error:"غير مصرح لك."},{status:403});
const bad=(error:string)=>NextResponse.json({error},{status:400});

type GameInput = {
 id?:unknown; slug?:unknown; title_ar?:unknown; title_en?:unknown;
 description_ar?:unknown; description_en?:unknown; instructions_ar?:unknown; instructions_en?:unknown;
 controls_ar?:unknown; controls_en?:unknown; thumbnail_url?:unknown; source_name?:unknown;
 source_page_url?:unknown; launch_url?:unknown; allowed_origin?:unknown; launch_mode?:unknown;
 license_type?:unknown; license_status?:unknown; authorization_reference?:unknown;
 authorization_notes?:unknown; rights_holder?:unknown; rights_expires_at?:unknown;
 rights_evidence_url?:unknown; status?:unknown; featured?:unknown; category_ids?:unknown;
 permissions_fullscreen?:unknown; permissions_pointer_lock?:unknown;
 permissions_orientation_lock?:unknown; mobile_support?:unknown; orientation?:unknown;
};
function str(v:unknown,max=5000){return typeof v==="string"?v.trim().slice(0,max):"";}
function validate(b:GameInput, partial=false){
 const slug=str(b.slug,100), titleAr=str(b.title_ar,180), titleEn=str(b.title_en,180);
 const launch=str(b.launch_url,2048), source=str(b.source_page_url,2048), origin=str(b.allowed_origin,255);
 if((!partial||b.slug!==undefined)&&!slugPattern.test(slug)) return "معرّف اللعبة غير صالح.";
 if((!partial||b.title_ar!==undefined)&&!titleAr) return "اسم اللعبة بالعربية مطلوب.";
 if((!partial||b.title_en!==undefined)&&!titleEn) return "اسم اللعبة بالإنجليزية مطلوب.";
 if((!partial||b.source_name!==undefined)&&!str(b.source_name,160)) return "اسم المصدر مطلوب.";
 for(const [key,value] of [["رابط التشغيل",b.launch_url],["رابط المصدر",b.source_page_url],["النطاق المسموح",b.allowed_origin]] as const) if(value!==undefined&&!safeUrl(value)) return key+" يجب أن يكون رابط HTTPS.";
 if(b.launch_url!==undefined&&b.allowed_origin!==undefined){let parsed:URL;try{parsed=new URL(launch);}catch{return "رابط تشغيل اللعبة غير صالح.";}if(parsed.origin!==origin)return "النطاق المسموح يجب أن يطابق نطاق رابط التشغيل.";}
 if(b.launch_mode!==undefined&&!["hosted-html5","authorized-embed","publisher-sdk"].includes(str(b.launch_mode))) return "طريقة تشغيل اللعبة غير صالحة.";
 if(b.license_status!==undefined&&!["pending","approved","rejected","expired"].includes(str(b.license_status))) return "حالة الترخيص غير صالحة.";
 if(b.status!==undefined&&!["draft","published","archived"].includes(str(b.status))) return "حالة اللعبة غير صالحة.";
 if(b.category_ids!==undefined&&(!Array.isArray(b.category_ids)||b.category_ids.length>10||b.category_ids.some(x=>typeof x!=="string"||x.length>80))) return "قائمة التصنيفات غير صالحة.";
 if(b.featured!==undefined&&typeof b.featured!=="boolean") return "قيمة المميزة غير صالحة.";
 return null;
}
function validateLegacy(b:GameInput){
 if(!["hosted-html5","authorized-embed","publisher-sdk"].includes(str(b.launch_mode))) return "طريقة تشغيل اللعبة غير صالحة.";
 if(!["pending","approved","rejected","expired"].includes(str(b.license_status,"20")||"pending")) return "حالة الترخيص غير صالحة.";
 if(b.status!==undefined&&!["draft","published","archived"].includes(str(b.status))) return "حالة اللعبة غير صالحة.";
 if(b.category_ids!==undefined&&(!Array.isArray(b.category_ids)||b.category_ids.length>10||b.category_ids.some(x=>typeof x!=="string"||x.length>80))) return "قائمة التصنيفات غير صالحة.";
 if(b.featured!==undefined&&typeof b.featured!=="boolean") return "قيمة المميزة غير صالحة.";
 return null;
}
export async function GET(){
 let actor;try{actor=await requireAdmin("editor");}catch{return denied();}
 const db=await getPlayNovaDb();
 const result=await db.prepare(`SELECT g.id,g.slug,g.title_ar,g.title_en,g.source_name,g.launch_url,g.license_status,g.authorization_reference,g.status,g.featured,g.updated_at,
 (SELECT GROUP_CONCAT(category_id, ',') FROM game_categories gc WHERE gc.game_id=g.id) AS category_ids
 FROM games g ORDER BY g.updated_at DESC`).all<Record<string,unknown>>();
 return NextResponse.json({games:result.results},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return denied();
 let actor;try{actor=await requireAdmin("editor");}catch{return denied();}
 let b:GameInput;try{b=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const error=validate(b);if(error)return bad(error);
 const status=(b.status??"draft") as GameStatus;
 const license=(b.license_status??"pending") as LicenseStatus;
 if(actor.role==="editor"&&license!=="pending")return denied();
 const auth=str(b.authorization_reference,500);
 if(status==="published"&&(!rolesCanPublish.includes(actor.role)||license!=="approved"||!auth||!str(b.rights_evidence_url,2048)||!safeUrl(b.rights_evidence_url)))return bad("لا يمكن النشر دون صلاحية مدير/مالك وموافقة الترخيص ورابط إثبات HTTPS ورقم تفويض.");
 const db=await getPlayNovaDb(),id=str(b.id,100)||crypto.randomUUID(),now=new Date().toISOString();
 try{
 await db.prepare(`INSERT INTO games(id,slug,title_ar,title_en,description_ar,description_en,instructions_ar,instructions_en,controls_ar,controls_en,thumbnail_url,source_name,source_page_url,launch_url,allowed_origin,launch_mode,license_type,license_status,authorization_reference,authorization_notes,permissions_fullscreen,permissions_pointer_lock,permissions_orientation_lock,status,featured,rights_holder,rights_expires_at,rights_evidence_url,mobile_support,orientation,updated_by,published_at)
 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
 id,str(b.slug,100),str(b.title_ar,180),str(b.title_en,180),str(b.description_ar),str(b.description_en),str(b.instructions_ar),str(b.instructions_en),str(b.controls_ar),str(b.controls_en),str(b.thumbnail_url,2048)||null,str(b.source_name,160),str(b.source_page_url,2048),str(b.launch_url,2048),str(b.allowed_origin,255),str(b.launch_mode),str(b.license_type,100)||"pending",license,auth,str(b.authorization_notes),b.permissions_fullscreen===true?1:0,b.permissions_pointer_lock===true?1:0,b.permissions_orientation_lock===true?1:0,status,b.featured===true?1:0,str(b.rights_holder,200),str(b.rights_expires_at,30)||null,str(b.rights_evidence_url,2048),b.mobile_support===true?1:0,["any","portrait","landscape"].includes(str(b.orientation))?str(b.orientation):"any",actor.email,status==="published"?now:null).run();
 const categories=(b.category_ids as string[]|undefined)??[];
 for(const category of categories) await db.prepare("INSERT INTO game_categories(game_id,category_id) SELECT ?,id FROM categories WHERE id=?").bind(id,category).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'game_created','game',?,?)").bind(actor.email,actor.role,id,JSON.stringify({status,license_status:license})).run();
 return NextResponse.json({ok:true,id},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:"تعذر حفظ اللعبة. تحقق من عدم تكرار المعرّف أو الرابط والبيانات.",detail:e instanceof Error?e.message:""},{status:409});}
}
export async function PATCH(request:NextRequest){
 if(!sameOrigin(request))return denied();
 let actor;try{actor=await requireAdmin("editor");}catch{return denied();}
 let b:GameInput;try{b=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const id=str(b.id,100);if(!id)return bad("معرّف اللعبة مطلوب.");
 const db=await getPlayNovaDb();
 const existing=await db.prepare("SELECT id,status,license_status,authorization_reference,rights_evidence_url FROM games WHERE id=?").bind(id).first<{id:string;status:GameStatus;license_status:LicenseStatus;authorization_reference:string;rights_evidence_url:string}>();
 if(!existing)return NextResponse.json({error:"اللعبة غير موجودة."},{status:404});
 const error=validate(b,true);if(error)return bad(error);
 if(actor.role==="editor"&&b.license_status!==undefined)return denied();
 const status=(b.status??existing.status) as GameStatus, license=(b.license_status??existing.license_status) as LicenseStatus;
 const auth=str(b.authorization_reference,500)||existing.authorization_reference;
 const evidence=b.rights_evidence_url===undefined?existing.rights_evidence_url:str(b.rights_evidence_url,2048);
 if(status==="published"&&(!rolesCanPublish.includes(actor.role)||license!=="approved"||!auth||!safeUrl(evidence)))return bad("النشر يتطلب مديرًا أو مالكًا وموافقة الترخيص وإثبات HTTPS.");
 const fields=["slug","title_ar","title_en","description_ar","description_en","instructions_ar","instructions_en","controls_ar","controls_en","thumbnail_url","source_name","source_page_url","launch_url","allowed_origin","launch_mode","license_type","license_status","authorization_reference","authorization_notes","rights_holder","rights_expires_at","rights_evidence_url","status","featured","mobile_support","orientation","permissions_fullscreen","permissions_pointer_lock","permissions_orientation_lock"];
 const values:unknown[]=[];const sets:string[]=[];
 for(const key of fields){if(b[key as keyof GameInput]!==undefined){sets.push(key+"=?");const v=b[key as keyof GameInput];values.push(["featured","mobile_support","permissions_fullscreen","permissions_pointer_lock","permissions_orientation_lock"].includes(key)?(v===true?1:0):key==="thumbnail_url"?(str(v,2048)||null):key==="rights_expires_at"?(str(v,30)||null):str(v,key.startsWith("description")||key.startsWith("instructions")||key.startsWith("controls")?5000:2048));}}
 if(status==="published"&&existing.status!=="published") {sets.push("published_at=?");values.push(new Date().toISOString());}
 if(status!=="published"){sets.push("published_at=NULL");}
 sets.push("updated_at=CURRENT_TIMESTAMP","updated_by=?");values.push(actor.email, id);
 await db.prepare("UPDATE games SET "+sets.join(",")+" WHERE id=?").bind(...values).run();
 if(Array.isArray(b.category_ids)){await db.prepare("DELETE FROM game_categories WHERE game_id=?").bind(id).run();for(const cat of b.category_ids)await db.prepare("INSERT INTO game_categories(game_id,category_id) SELECT ?,id FROM categories WHERE id=?").bind(id,cat).run();}
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'game_updated','game',?,?)").bind(actor.email,actor.role,id,JSON.stringify({status,license_status:license})).run();
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
