"use client";
export type AnalyticsType="game_view"|"search"|"game_start"|"load_success"|"load_failure"|"favorite_add"|"favorite_remove"|"category_visit"|"session_end"|"web_vital"|"client_error"|"server_error";
export function trackAnalytics(type:AnalyticsType,data:{slug?:string;categoryId?:string;term?:string;durationMs?:number;failureCode?:string;metricName?:string;metricValue?:number;searchResults?:number}={}){
 try{
  if(localStorage.getItem("playnova-analytics-consent")!=="granted")return;
  let session=localStorage.getItem("playnova-analytics-session");
  if(!session){session=crypto.randomUUID();localStorage.setItem("playnova-analytics-session",session);}
  const payload={eventId:crypto.randomUUID(),sessionId:session,type,...data,device:/tablet|ipad/i.test(navigator.userAgent)?"tablet":matchMedia("(max-width: 767px)").matches?"mobile":"desktop",sourceHost:document.referrer?new URL(document.referrer).hostname:""};
  const body=JSON.stringify(payload);
  
  void fetch("/api/analytics/events",{method:"POST",headers:{"Content-Type":"application/json","X-PlayNova-Analytics-Consent":"granted"},body,keepalive:type==="session_end"}).catch(()=>{});
 }catch{/* Analytics must never interrupt the site experience. */}
}
