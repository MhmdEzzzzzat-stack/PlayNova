import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {getPlayNovaDb} from "@/lib/db";
import {isAnalyticsEventType,isAnalyticsId} from "@/lib/analytics-validation";
type Body={eventId?:unknown;type?:unknown;slug?:unknown;categoryId?:unknown;term?:unknown;sourceHost?:unknown;device?:unknown;durationMs?:unknown;metricName?:unknown;metricValue?:unknown;failureCode?:unknown;sessionId?:unknown;searchResults?:unknown};
const str=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
const response=(status:number,error?:string)=>NextResponse.json(error?{error}:{ok:true},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:NextRequest){
 const userAgent=request.headers.get("user-agent")||"";if(/bot|crawler|spider|slurp|headless|lighthouse|pagespeed/i.test(userAgent))return response(202);
 const length=Number(request.headers.get("content-length")||0);if(length>8192)return response(413,"Event payload too large.");
 let body:Body;try{body=await request.json() as Body;}catch{return response(400,"Invalid event payload.");}
 const type=str(body.type,32),eventId=str(body.eventId,80),sessionId=str(body.sessionId,80);
 if(!isAnalyticsEventType(type)||!isAnalyticsId(eventId)||!isAnalyticsId(sessionId,20,80))return response(400,"Invalid event.");
 const consent=request.headers.get("x-playnova-analytics-consent");if(consent!=="granted")return response(403,"Analytics consent is required.");
 const origin=request.headers.get("origin");try{if(!origin||new URL(origin).origin!==new URL(request.url).origin)return response(403,"Cross-origin event submission is not allowed.");}catch{return response(403,"Invalid request origin.");}
 const slug=str(body.slug,120),categoryId=str(body.categoryId,80);let term=str(body.term,80).replace(/[<>\u0000-\u001f]/g,"");if(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(term)||/https?:\/\//i.test(term)||/\+?\d[\d\s().-]{7,}\d/.test(term))term="";const device=["mobile","desktop","tablet"].includes(str(body.device,12))?str(body.device,12):"unknown";
 const duration=Number(body.durationMs),metricValue=Number(body.metricValue);
 if(body.durationMs!==undefined&&(!Number.isFinite(duration)||duration<0||duration>3600000))return response(400,"Invalid duration.");
 if(body.metricValue!==undefined&&(!Number.isFinite(metricValue)||metricValue<0||metricValue>60000))return response(400,"Invalid metric value.");
 const resultsCount=Number(body.searchResults);if(body.searchResults!==undefined&&(!Number.isInteger(resultsCount)||resultsCount<0||resultsCount>10000))return response(400,"Invalid search result count.");
 const metricName=["LCP","CLS","INP","FCP","TTFB"].includes(str(body.metricName,8))?str(body.metricName,8):"";
 const failure=["timeout","network","blocked","provider","runtime","promise","server","unknown"].includes(str(body.failureCode,20))?str(body.failureCode,20):"";
 const source=str(body.sourceHost,120).toLowerCase().replace(/[^a-z0-9.-]/g,"");
 const db=await getPlayNovaDb();let gameId:string|null=null;
 if(slug){const game=await db.prepare("SELECT id FROM games WHERE slug=? AND status='published' AND license_status='approved' AND moderation_status='active'").bind(slug).first<{id:string}>();if(!game)return response(404,"Game not found.");gameId=game.id;}
 if(categoryId){const cat=await db.prepare("SELECT id FROM categories WHERE id=? AND visible=1").bind(categoryId).first<{id:string}>();if(!cat)return response(404,"Category not found.");}
 if(type==="search"&&!term)return response(400,"Search term required.");
 const sessionHash=createHash("sha256").update(sessionId).digest("hex");
 const recent=await db.prepare("SELECT COUNT(*) AS total FROM analytics_events WHERE session_hash=? AND created_at>=datetime('now','-1 hour')").bind(sessionHash).first<{total:number}>();if((recent?.total||0)>=120)return response(429,"Analytics event rate limit reached.");
 try{
 const inserted=await db.prepare("INSERT OR IGNORE INTO analytics_events(event_id,event_type,game_id,category_id,search_term,search_results_count,source_host,device_type,session_hash,duration_ms,metric_name,metric_value,failure_code) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)")
 .bind(eventId,type,gameId,categoryId||null,term,body.searchResults===undefined?-1:resultsCount,source,device,sessionHash,body.durationMs===undefined?null:Math.round(duration),metricName,body.metricValue===undefined?null:metricValue,failure).run() as {meta?:{changes?:number}};
 return NextResponse.json({ok:true,duplicate:inserted.meta?.changes===0},{status:202,headers:{"Cache-Control":"no-store"}});
 }catch{return response(503,"Analytics is temporarily unavailable.");}
}
