import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";
const sameOrigin=(r:NextRequest)=>{try{const o=r.headers.get("origin");return !!o&&new URL(o).origin===new URL(r.url).origin;}catch{return false;}};
const denied=()=>NextResponse.json({error:"غير مصرح لك."},{status:403});
const bad=(error:string)=>NextResponse.json({error},{status:400});
const str=(v:unknown,max=3000)=>typeof v==="string"?v.trim().slice(0,max):"";
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type Input={id?:unknown;slug?:unknown;name_ar?:unknown;name_en?:unknown;description_ar?:unknown;description_en?:unknown;visible?:unknown;sort_order?:unknown};
function validate(b:Input,partial=false){
 if((!partial||b.slug!==undefined)&&!slugPattern.test(str(b.slug,100)))return "المعرّف يجب أن يكون أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.";
 if((!partial||b.name_ar!==undefined)&&!str(b.name_ar,120))return "اسم التصنيف بالعربية مطلوب.";
 if((!partial||b.name_en!==undefined)&&!str(b.name_en,120))return "اسم التصنيف بالإنجليزية مطلوب.";
 if(b.visible!==undefined&&typeof b.visible!=="boolean")return "حالة الظهور غير صالحة.";
 if(b.sort_order!==undefined&&(typeof b.sort_order!=="number"||!Number.isInteger(b.sort_order)||b.sort_order<0||b.sort_order>100000))return "ترتيب التصنيف غير صالح.";
 return null;
}
export async function GET(){
 try{await requireAdmin("editor");}catch{return denied();}
 const db=await getPlayNovaDb();
 const result=await db.prepare(`SELECT c.*,(SELECT COUNT(*) FROM game_categories gc WHERE gc.category_id=c.id) AS games_count FROM categories c ORDER BY c.sort_order,c.name_ar`).all();
 return NextResponse.json({categories:result.results},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return denied();
 let actor;try{actor=await requireAdmin("editor");}catch{return denied();}
 let b:Input;try{b=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const error=validate(b);if(error)return bad(error);
 const id=str(b.id,80)||str(b.slug,100),db=await getPlayNovaDb();
 try{
 await db.prepare("INSERT INTO categories(id,slug,name_ar,name_en,description_ar,description_en,visible,sort_order) VALUES(?,?,?,?,?,?,?,?)").bind(id,str(b.slug,100),str(b.name_ar,120),str(b.name_en,120),str(b.description_ar),str(b.description_en),b.visible===false?0:1,Number(b.sort_order)||0).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'category_created','category',?,?)").bind(actor.email,actor.role,id,JSON.stringify({slug:str(b.slug,100)})).run();
 return NextResponse.json({ok:true,id},{status:201});
 }catch{return NextResponse.json({error:"تعذر إنشاء التصنيف. قد يكون المعرّف مستخدمًا بالفعل."},{status:409});}
}
export async function PATCH(request:NextRequest){
 if(!sameOrigin(request))return denied();
 let actor;try{actor=await requireAdmin("editor");}catch{return denied();}
 let b:Input;try{b=await request.json();}catch{return bad("بيانات غير صالحة.");}
 const id=str(b.id,80);if(!id)return bad("معرّف التصنيف مطلوب.");
 const error=validate(b,true);if(error)return bad(error);
 const db=await getPlayNovaDb();
 const existing=await db.prepare("SELECT id FROM categories WHERE id=?").bind(id).first();if(!existing)return NextResponse.json({error:"التصنيف غير موجود."},{status:404});
 const fields=["slug","name_ar","name_en","description_ar","description_en","visible","sort_order"],sets:string[]=[],values:unknown[]=[];
 for(const key of fields){if(b[key as keyof Input]!==undefined){sets.push(key+"=?");const v=b[key as keyof Input];values.push(key==="visible"?(v===true?1:0):key==="sort_order"?Number(v):str(v,key==="slug"?100:key.startsWith("name")?120:3000));}}
 if(!sets.length)return bad("لا توجد تغييرات لحفظها.");
 values.push(id);
 try{
 await db.prepare("UPDATE categories SET "+sets.join(",")+" WHERE id=?").bind(...values).run();
 await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'category_updated','category',?,?)").bind(actor.email,actor.role,id,JSON.stringify({fields:Object.keys(b).filter(k=>k!=="id")})).run();
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"تعذر تحديث التصنيف. تحقق من عدم تكرار المعرّف."},{status:409});}
}
