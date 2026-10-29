import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {getPlayNovaDb} from "@/lib/db";
const TYPES=["game_view","search","game_start","load_success","load_failure","favorite_add","favorite_remove","category_visit","session_end","web_vital"] as const;
type EventType=typeof TYPES[number];
type Body={eventId?:unknown;type?:unknown;slug?:unknown;categoryId?:unknown;term?:unknown;sourceHost?:unknown;device?:unknown;durationMs?:unknown;metricName?:unknown;metricValue?:unknown;failureCode?:unknown;sessionId?:unknown};
const str=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const response=(status:number,error?:string)=>NextResponse.json(error?{error}:{ok:true},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:NextRequest){
 let body:Body;try{body=await request.json() as Body;}catch{return response(400,"Invalid event payload.");}
 const type=str(body.type,32) as EventType,eventId=str(body.eventId,80),sessionId=str(body.sessionId,80);
 if(!TYPES.includes(type)||!/^[a-zA-Z0-9_-]{12,80}$/.test(eventId)||!/^[a-zA-Z0-9_-]{20,80}$/.test(sessionId))return response(400,"Invalid event.");
 const consent=request.headers.get("x-playnova-analytics-consent");if(consent!=="granted")return response(403,"Analytics consent is required.");
 const slug=str(body.slug,120),categoryId=str(body.categoryId,80),term=str(body.term,80).replace(/[<>\u0000-\u001f]/g,""),device=["mobile","desktop","tablet"].includes(str(body.device,12))?str(body.device,12):"unknown";
 const duration=Number(body.durationMs),metricValue=Number(body.metricValue);
 if(body.durationMs!==undefined&&(!Number.isFinite(duration)||duration<0||duration>3600000))return response(400,"Invalid duration.");
 if(body.metricValue!==undefined&&(!Number.isFinite(metricValue)||metricValue<0||metricValue>60000))return response(400,"Invalid metric value.");
 const resultsCount=Number(body.searchResults);if(body.searchResults!==undefined&&(!Number.isInteger(resultsCount)||resultsCount<0||resultsCount>10000))return response(400,"Invalid search result count.");
 const metricName=["LCP","CLS","INP","FCP","TTFB"].includes(str(body.metricName,8))?str(body.metricName,8):"";
 const failure=["timeout","network","blocked","provider","unknown"].includes(str(body.failureCode,20))?str(body.failureCode,20):"";
 const source=str(body.sourceHost,120).toLowerCase().replace(/[^a-z0-9.-]/g,"");
 const db=await getPlayNovaDb();let gameId:string|null=null;
 if(slug){const game=await db.prepare("SELECT id FROM games WHERE slug=? AND status='published' AND license_status='approved'").bind(slug).first<{id:string}>();if(!game)return response(404,"Game not found.");gameId=game.id;}
 if(categoryId){const cat=await db.prepare("SELECT id FROM categories WHERE id=? AND visible=1").bind(categoryId).first<{id:string}>();if(!cat)return response(404,"Category not found.");}
 if(type==="search"&&!term)return response(400,"Search term required.");
 const sessionHash=createHash("sha256").update(sessionId).digest("hex");
 try{
 await db.prepare("INSERT OR IGNORE INTO analytics_events(event_id,event_type,game_id,category_id,search_term,search_results_count,source_host,device_type,session_hash,duration_ms,metric_name,metric_value,failure_code) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)")
 .bind(eventId,type,gameId,categoryId||null,term,body.searchResults===undefined?-1:resultsCount,source,device,sessionHash,body.durationMs===undefined?null:Math.round(duration),metricName,body.metricValue===undefined?null:metricValue,failure).run();
 return response(202);
 }catch{return response(503,"Analytics is temporarily unavailable.");}
}
