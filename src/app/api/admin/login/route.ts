import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword, COOKIE_NAME } from "@/lib/admin-auth";
import { getPlayNovaDb } from "@/lib/db";


function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
async function digest(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "طلب غير صالح." }, { status: 403 });
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات غير صالحة." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 128) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة." }, { status: 400 });
  }

  const db = await getPlayNovaDb();
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const attemptKey = await digest(email + "|" + ip);
  const count = await db.prepare(
    "SELECT COUNT(*) AS total FROM admin_login_attempts WHERE attempt_key = ? AND created_at >= datetime('now', '-15 minutes')"
  ).bind(attemptKey).first<{ total: number }>();
  if ((count?.total ?? 0) >= 8) return NextResponse.json({ error: "محاولات كثيرة. حاول بعد 15 دقيقة." }, { status: 429 });

  const admin = await db.prepare(
    "SELECT email, password_hash FROM admin_users WHERE email = ? AND active = 1 LIMIT 1"
  ).bind(email).first<{ email: string; password_hash: string | null }>();

  const valid = !!admin?.password_hash && await verifyAdminPassword(password, admin.password_hash);
  if (!valid || !admin) {
    await db.prepare("INSERT INTO admin_login_attempts (attempt_key) VALUES (?)").bind(attemptKey).run();
    await db.prepare("DELETE FROM admin_login_attempts WHERE created_at < datetime('now', '-1 day')").run();
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  await db.prepare("DELETE FROM admin_login_attempts WHERE attempt_key = ?").bind(attemptKey).run();
  const token = await createAdminSession(admin.email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, secure: new URL(request.url).protocol === "https:",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
