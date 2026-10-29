import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAdminSession, hashAdminPassword, COOKIE_NAME } from "@/lib/admin-auth";
import { getPlayNovaDb } from "@/lib/db";


function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).origin === new URL(request.url).origin; } catch {}
  if (!sameOrigin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const context = await getCloudflareContext({ async: true });
  const env = context.env as unknown as { ADMIN_BOOTSTRAP_SECRET?: string; ADMIN_BOOTSTRAP_EMAIL?: string };
  const secret = env.ADMIN_BOOTSTRAP_SECRET ?? "";
  const ownerEmail = (env.ADMIN_BOOTSTRAP_EMAIL ?? "").trim().toLowerCase();
  if (!secret || !ownerEmail) return NextResponse.json({ error: "Owner bootstrap is not configured." }, { status: 404 });

  let body: { email?: string; password?: string; secret?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const suppliedSecret = typeof body.secret === "string" ? body.secret : "";
  if (!constantTimeEqual(suppliedSecret, secret) || !constantTimeEqual(email, ownerEmail) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "Bootstrap details are invalid." }, { status: 403 });
  }

  const db = await getPlayNovaDb();
  const passwordHash = await hashAdminPassword(password);
  const inserted = await db.prepare(
    `INSERT INTO admin_users (email, role, active, password_hash)
     SELECT ?, 'owner', 1, ?
     WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE role = 'owner')`
  ).bind(ownerEmail, passwordHash).run() as { meta?: { changes?: number } };
  if ((inserted.meta?.changes ?? 0) !== 1) {
    return NextResponse.json({ error: "Owner account has already been initialized." }, { status: 409 });
  }

  const token = await createAdminSession(ownerEmail);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, secure: new URL(request.url).protocol === "https:",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
