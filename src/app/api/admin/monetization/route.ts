import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "@/lib/admin-auth";
import {getPlayNovaDb} from "@/lib/db";

const ids=["home_top","home_feed","game_below_player","game_sidebar","category_feed"] as const;
const keys=["display_ads","game_ads","sponsored_games"] as const;
const forbidden=()=>NextResponse.json({error:"تحتاج صلاحية المالك أو المدير."},{status:403});
function sameOrigin(r:NextRequest){try{return !!r.headers.get("origin")&&new URL(r.headers.get("origin")!).origin===new URL(r.url).origin;}catch{return false;}}
export async function GET(){
 let actor;try{actor=await requireAdmin("administrator");}catch{return forbidden();}
 const db=await getPlayNovaDb();
 const [settings,placements,eventCounts,revenue]=await Promise.all([
  db.prepare("SELECT setting_key,enabled,provider,provider_approved,configured,personalized_ads,updated_at FROM monetization_settings ORDER BY setting_key").all(),
  db.prepare("SELECT placement_id,enabled,format,label_required,max_height_px,updated_at FROM ad_placements ORDER BY placement_id").all(),
  db.prepare("SELECT SUM(event_type='ad_request') requests,SUM(event_type='impression') impressions,SUM(event_type='click') clicks FROM monetization_events").first(),
  db.prepare("SELECT COUNT(*) AS reports, SUM(amount_minor) AS amount_minor, MAX(currency) AS currency FROM monetization_revenue_imports").first()
 ]);
 const env=process.env;
 return NextResponse.json({settings:settings.results,placements:placements.results,metrics:{requests:eventCounts?.requests||0,impressions:eventCounts?.impressions||0,clicks:eventCounts?.clicks||0,revenueReports:revenue?.reports||0,revenueAvailable:(revenue?.reports||0)>0},readiness:{
  providerApproval:env.ADS_PROVIDER_APPROVED==="true",
  providerConfigured:env.ADS_PROVIDER_CONFIGURED==="true",
  providerName:env.ADS_PROVIDER_NAME||"none",
  gamingAdsApproval:env.GAME_ADS_PROVIDER_APPROVED==="true",
  gamingAdsConfigured:env.GAME_ADS_PROVIDER_CONFIGURED==="true",
  note:"Environment readiness is an operator assertion; retain provider approval evidence outside the application."
 }},{headers:{"Cache-Control":"no-store"}});
}
type Body={kind?:unknown;id?:unknown;enabled?:unknown};
export async function PATCH(r:NextRequest){
 if(!sameOrigin(r))return forbidden();
 let actor;try{actor=await requireAdmin("administrator");}catch{return forbidden();}
 let b:Body;try{b=await r.json() as Body;}catch{return NextResponse.json({error:"بيانات غير صالحة."},{status:400});}
 if(typeof b.enabled!=="boolean"||typeof b.id!=="string")return NextResponse.json({error:"بيانات غير صالحة."},{status:400});
 const db=await getPlayNovaDb();
 if(b.kind==="placement"&&ids.includes(b.id as typeof ids[number])){
  await db.prepare("UPDATE ad_placements SET enabled=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE placement_id=?").bind(b.enabled?1:0,actor.email,b.id).run();
  await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'ad_placement_toggled','ad_placement',?,?)").bind(actor.email,actor.role,b.id,JSON.stringify({enabled:b.enabled})).run();
 }else if(b.kind==="feature"&&keys.includes(b.id as typeof keys[number])){
  const readiness=process.env.ADS_PROVIDER_APPROVED==="true"&&process.env.ADS_PROVIDER_CONFIGURED==="true";
  const gameReady=process.env.GAME_ADS_PROVIDER_APPROVED==="true"&&process.env.GAME_ADS_PROVIDER_CONFIGURED==="true";
  if(b.enabled&&b.id==="display_ads"&&!readiness)return NextResponse.json({error:"لا يمكن التفعيل قبل اعتماد مزود الإعلانات وإكمال إعداداته."},{status:409});
  if(b.enabled&&b.id==="game_ads"&&!gameReady)return NextResponse.json({error:"لا يمكن تفعيل إعلانات الألعاب قبل اعتماد مزود SDK وإعداداته."},{status:409});
  await db.prepare("UPDATE monetization_settings SET enabled=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?").bind(b.enabled?1:0,actor.email,b.id).run();
  await db.prepare("INSERT INTO admin_audit_log_v2(actor_email,actor_role,action,entity_type,entity_id,details_json) VALUES(?,?, 'monetization_feature_toggled','monetization',?,?)").bind(actor.email,actor.role,b.id,JSON.stringify({enabled:b.enabled})).run();
 }else return NextResponse.json({error:"معرّف غير معروف."},{status:400});
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
