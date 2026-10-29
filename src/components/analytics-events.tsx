"use client";
import {useEffect} from "react";
import {trackAnalytics} from "@/lib/analytics-client";
export function GameViewEvent({slug}:{slug:string}){useEffect(()=>{trackAnalytics("game_view",{slug});const started=Date.now();const end=()=>trackAnalytics("session_end",{slug,durationMs:Date.now()-started});window.addEventListener("pagehide",end,{once:true});return()=>window.removeEventListener("pagehide",end);},[slug]);return null;}
export function CategoryViewEvent({categoryId}:{categoryId:string}){useEffect(()=>{trackAnalytics("category_visit",{categoryId});},[categoryId]);return null;}
export function SearchEvent({term,results}:{term:string;results:number}){useEffect(()=>{if(term.trim())trackAnalytics("search",{term:term.trim(),searchResults:results});},[term,results]);return null;}
