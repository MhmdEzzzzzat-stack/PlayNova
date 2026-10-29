"use client";
import {useEffect} from "react";
import {trackAnalytics} from "@/lib/analytics-client";
export default function SiteVitals(){useEffect(()=>{
 if(localStorage.getItem("playnova-analytics-consent")!=="granted")return;
 const observers:PerformanceObserver[]=[];
 const observe=(type:string,cb:(list:PerformanceEntryList)=>void)=>{try{const o=new PerformanceObserver(list=>cb(list));o.observe({type,buffered:true});observers.push(o);}catch{}};
 observe("largest-contentful-paint",list=>{const e=list.getEntries().at(-1) as (PerformanceEntry&{startTime:number})|undefined;if(e)trackAnalytics("web_vital",{metricName:"LCP",metricValue:e.startTime});});
 observe("layout-shift",list=>{const entries=list.getEntries() as (PerformanceEntry&{value:number;hadRecentInput:boolean})[];const value=entries.filter(e=>!e.hadRecentInput).reduce((s,e)=>s+e.value,0);trackAnalytics("web_vital",{metricName:"CLS",metricValue:value});});
 observe("event",list=>{const entries=list.getEntries() as (PerformanceEntry&{duration:number;interactionId:number})[];const values=entries.filter(e=>e.interactionId>0).map(e=>e.duration);if(values.length)trackAnalytics("web_vital",{metricName:"INP",metricValue:Math.max(...values)});});
 observe("paint",list=>{for(const e of list.getEntries())if(e.name==="first-contentful-paint")trackAnalytics("web_vital",{metricName:"FCP",metricValue:e.startTime});});
 const nav=performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming|undefined;if(nav)trackAnalytics("web_vital",{metricName:"TTFB",metricValue:nav.responseStart});
 return()=>observers.forEach(o=>o.disconnect());
},[]);return null;}
