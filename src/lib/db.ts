import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
};
export type PlayNovaD1 = { prepare(sql: string): D1Statement };

export async function getPlayNovaDb(): Promise<PlayNovaD1> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: PlayNovaD1 }).DB;
  if (!db) throw new Error("PlayNova D1 binding is missing. Configure DB in wrangler.jsonc and Cloudflare Workers.");
  return db;
}
