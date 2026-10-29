"use client";
import {useEffect} from "react";
import {trackAnalytics} from "@/lib/analytics-client";
export default function SiteVitals(){useEffect(()=>{
 if(localStorage.getItem("playnova-analytics-consent")!=="granted")return;
 const observers:PerformanceObserver[]=[],latest:Record<string,number>={};
 const observe=(type:string,cb:(list:PerformanceObserverEntryList)=>void)=>{try{const o=new PerformanceObserver(list=>cb(list));o.observe({type,buffered:true});observers.push(o);}catch{}};
 observe("largest-contentful-paint",list=>{const e=list.getEntries()[list.getEntries().length-1];if(e)latest.LCP=e.startTime;});
 observe("layout-shift",list=>{const entries=list.getEntries() as (PerformanceEntry&{value:number;hadRecentInput:boolean})[];latest.CLS=(latest.CLS||0)+entries.filter(e=>!e.hadRecentInput).reduce((s,e)=>s+e.value,0);});
 observe("event",list=>{const entries=list.getEntries() as (PerformanceEntry&{duration:number;interactionId:number})[];for(const e of entries)if(e.interactionId>0)latest.INP=Math.max(latest.INP||0,e.duration);});
 observe("paint",list=>{for(const e of list.getEntries())if(e.name==="first-contentful-paint")latest.FCP=e.startTime;});
 const nav=performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming|undefined;if(nav)latest.TTFB=nav.responseStart;
 const flush=()=>{for(const name of ["LCP","CLS","INP","FCP","TTFB"])if(Number.isFinite(latest[name]))trackAnalytics("web_vital",{metricName:name,metricValue:latest[name]});};
 const onError=()=>trackAnalytics("client_error",{failureCode:"runtime"});
 const onRejection=()=>trackAnalytics("client_error",{failureCode:"promise"});
 window.addEventListener("pagehide",flush,{once:true});window.addEventListener("error",onError);window.addEventListener("unhandledrejection",onRejection);
 return()=>{observers.forEach(o=>o.disconnect());window.removeEventListener("pagehide",flush);window.removeEventListener("error",onError);window.removeEventListener("unhandledrejection",onRejection);};
},[]);return null;}
