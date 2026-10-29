import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
};
export type PlayNovaD1 = { prepare(sql: string): D1Statement };

function monitorStatement(statement:D1Statement,label:string):D1Statement {
  const measure=async<T>(operation:string,fn:()=>Promise<T>):Promise<T>=>{
    const started=performance.now();
    try{return await fn();}
    finally{const durationMs=Math.round(performance.now()-started);if(durationMs>=250)console.warn("PlayNova slow D1 query",JSON.stringify({operation,label,durationMs}));}
  };
  return {
    bind:(...values:unknown[])=>monitorStatement(statement.bind(...values),label),
    first:<T=Record<string,unknown>>()=>measure("first",()=>statement.first<T>()),
    all:<T=Record<string,unknown>>()=>measure("all",()=>statement.all<T>()),
    run:()=>measure("run",()=>statement.run()),
  };
}

export async function getPlayNovaDb(): Promise<PlayNovaD1> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: PlayNovaD1 }).DB;
  if (!db) throw new Error("PlayNova D1 binding is missing. Configure DB in wrangler.jsonc and Cloudflare Workers.");
  return {prepare(sql:string){const label=sql.trim().split(/\\s+/).slice(0,2).join(" ");return monitorStatement(db.prepare(sql),label);}};
}
