import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getPlayNovaDb } from "@/lib/db";

export type AdminRole = "owner" | "administrator" | "editor" | "reviewer";
export type AdminIdentity = { email: string; role: AdminRole };

const roleRank: Record<AdminRole, number> = {
  reviewer: 1,
  editor: 2,
  administrator: 3,
  owner: 4,
};

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function accessConfig() {
  const { env } = getCloudflareContext() as unknown as { env: Record<string, string | undefined> };
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.replace(/^https?:\\/\\//, "").replace(/\\/$/, "");
  const audience = env.CF_ACCESS_AUD;
  if (!teamDomain || !audience) {
    throw new Error("Admin authentication is not configured. Set CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD.");
  }
  return { issuer: `https://${teamDomain}`, audience };
}

/** Verifies the signed Cloudflare Access assertion. Never trust email headers supplied by the browser. */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const { issuer, audience } = accessConfig();
  const token = (await headers()).get("cf-access-jwt-assertion");
  if (!token) return null;

  try {
    jwks ??= createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, { issuer, audience });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) return null;

    const db = await getPlayNovaDb();
    const admin = await db.prepare(
      "SELECT email, role FROM admin_users WHERE lower(email) = ? AND active = 1 LIMIT 1"
    ).bind(email).first<{ email: string; role: AdminRole }>();

    if (!admin || !(admin.role in roleRank)) return null;
    return { email: admin.email, role: admin.role };
  } catch {
    return null;
  }
}

export async function requireAdmin(minimumRole: AdminRole = "reviewer"): Promise<AdminIdentity> {
  const identity = await getAdminIdentity();
  if (!identity || roleRank[identity.role] < roleRank[minimumRole]) {
    throw new Error("FORBIDDEN");
  }
  return identity;
}

export function canManageRole(actor: AdminRole, target: AdminRole): boolean {
  if (actor === "owner") return true;
  return actor === "administrator" && target !== "owner" && target !== "administrator";
}
