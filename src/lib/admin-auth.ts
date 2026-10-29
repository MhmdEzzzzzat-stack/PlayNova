import "server-only";

import { cookies } from "next/headers";
import { getPlayNovaDb } from "@/lib/db";

export type AdminRole = "owner" | "administrator" | "editor" | "reviewer";
export type AdminIdentity = { email: string; role: AdminRole };

const COOKIE_NAME = "pn_admin_session";
const ITERATIONS = 310_000;
const roleRank: Record<AdminRole, number> = { reviewer: 1, editor: 2, administrator: 3, owner: 4 };

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
async function sha256(value: string): Promise<string> {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  return `pbkdf2-sha256$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
}

export async function verifyAdminPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [scheme, iterationsText, saltText, expectedText] = encoded.split("$");
    const iterations = Number(iterationsText);
    if (scheme !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;
    const salt = new Uint8Array(fromBase64Url(saltText));
    const expected = fromBase64Url(expectedText);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, expected.length * 8));
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
    return difference === 0;
  } catch {
    return false;
  }
}

export async function createAdminSession(email: string): Promise<string> {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const db = await getPlayNovaDb();
  await db.prepare("INSERT INTO admin_sessions (token_hash, admin_email, expires_at) VALUES (?, ?, datetime('now', '+7 days'))")
    .bind(await sha256(token), email).run();
  return token;
}

export async function revokeAdminSession(token: string): Promise<void> {
  const db = await getPlayNovaDb();
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token || token.length > 128) return null;
    const db = await getPlayNovaDb();
    const identity = await db.prepare(
      `SELECT u.email, u.role FROM admin_sessions s
       JOIN admin_users u ON u.email = s.admin_email
       WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
         AND u.active = 1 AND u.password_hash IS NOT NULL LIMIT 1`
    ).bind(await sha256(token)).first<AdminIdentity>();
    if (!identity || !(identity.role in roleRank)) return null;
    return identity;
  } catch {
    return null;
  }
}

export async function requireAdmin(minimumRole: AdminRole = "reviewer"): Promise<AdminIdentity> {
  const identity = await getAdminIdentity();
  if (!identity || roleRank[identity.role] < roleRank[minimumRole]) throw new Error("FORBIDDEN");
  return identity;
}

export function canManageRole(actor: AdminRole, target: AdminRole): boolean {
  if (actor === "owner") return true;
  return actor === "administrator" && target !== "owner" && target !== "administrator";
}

export { COOKIE_NAME };
