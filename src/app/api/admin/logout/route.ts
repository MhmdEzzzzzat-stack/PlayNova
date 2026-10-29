import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, revokeAdminSession } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let allowed = false;
  try { allowed = Boolean(origin) && new URL(origin!).origin === new URL(request.url).origin; } catch {}
  if (!allowed) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (token) await revokeAdminSession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true, secure: new URL(request.url).protocol === "https:",
    sameSite: "lax", path: "/", maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
