import {getCloudflareContext} from "@opennextjs/cloudflare";
import {getPlayNovaDb} from "@/lib/db";
type Bucket={get:(key:string)=>Promise<{body:ReadableStream;httpMetadata?:{contentType?:string}}|null>};
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return new Response("Not found",{status:404});
 const db=await getPlayNovaDb();
 const asset=await db.prepare("SELECT storage_key,content_type,asset_type,status FROM content_assets WHERE id=?").bind(id).first<{storage_key:string;content_type:string;asset_type:string;status:string}>();
 if(!asset||!["thumbnail","screenshot"].includes(asset.asset_type)||!["approved","published"].includes(asset.status))return new Response("Not found",{status:404});
 const {env}=await getCloudflareContext({async:true});
 const bucket=(env as unknown as {ASSETS_BUCKET?:Bucket}).ASSETS_BUCKET;
 if(!bucket)return new Response("Storage unavailable",{status:503});
 const object=await bucket.get(asset.storage_key);
 if(!object)return new Response("Not found",{status:404});
 return new Response(object.body,{headers:{"Content-Type":asset.content_type,"X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}});
}
