import {getPlayNovaDb} from "@/lib/db";
import {getCloudflareContext} from "@opennextjs/cloudflare";
type Props={placementId:"home_top"|"home_feed"|"game_below_player"|"game_sidebar"|"category_feed";locale?:"ar"|"en"};
export default async function AdPlacement({placementId,locale="ar"}:Props){
 try{
  const {env}=await getCloudflareContext({async:true});
  const flags=env as unknown as Record<string,string|undefined>;
  if(flags.ADS_PROVIDER_APPROVED!=="true"||flags.ADS_PROVIDER_CONFIGURED!=="true")return null;
  const db=await getPlayNovaDb();
  const [feature,slot]=await Promise.all([
   db.prepare("SELECT enabled FROM monetization_settings WHERE setting_key='display_ads'").first<{enabled:number}>(),
   db.prepare("SELECT enabled,label_required,max_height_px FROM ad_placements WHERE placement_id=?").bind(placementId).first<{enabled:number;label_required:number;max_height_px:number}>()
  ]);
  if(!feature?.enabled||!slot?.enabled)return null;
  // Provider SDK insertion is intentionally absent until an approved adapter is implemented.
  return <aside className="game-ad-slot" aria-label={locale==="ar"?"إعلان":"Advertisement"} style={{minHeight:0,maxHeight:slot.max_height_px,overflow:"hidden"}}><span>{locale==="ar"?"مساحة إعلانية":"Advertisement"}{slot.label_required?" · "+(locale==="ar"?"إعلان":"Ad"):""}</span></aside>;
 }catch{return null;}
}
