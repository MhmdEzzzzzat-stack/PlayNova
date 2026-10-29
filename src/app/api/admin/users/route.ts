import { NextRequest, NextResponse } from "next/server";
import { canManageRole, hashAdminPassword, requireAdmin, type AdminRole } from "@/lib/admin-auth";
import { getPlayNovaDb } from "@/lib/db";

const roles: AdminRole[] = ["owner", "administrator", "editor", "reviewer"];
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  try { return !!origin && new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.length <= 254;
}
function validRole(value: unknown): value is AdminRole {
  return typeof value === "string" && roles.includes(value as AdminRole);
}
function forbidden() { return NextResponse.json({ error: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 }); }

export async function GET() {
  try {
    const actor = await requireAdmin("administrator");
    const db = await getPlayNovaDb();
    const result = await db.prepare(
      "SELECT email, role, active, created_at, updated_at FROM admin_users ORDER BY CASE role WHEN 'owner' THEN 1 WHEN 'administrator' THEN 2 WHEN 'editor' THEN 3 ELSE 4 END, email"
    ).all<{email:string;role:AdminRole;active:number;created_at:string;updated_at:string}>();
    const visible = actor.role === "owner" ? result.results : result.results.filter((u) => u.role !== "owner" && u.role !== "administrator");
    return NextResponse.json({ users: visible }, { headers: { "Cache-Control": "no-store" } });
  } catch { return forbidden(); }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  let actor;
  try { actor = await requireAdmin("administrator"); } catch { return forbidden(); }
  let body: {email?:unknown; role?:unknown; password?:unknown};
  try { body = await request.json(); } catch { return NextResponse.json({error:"بيانات غير صالحة."},{status:400}); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role;
  const password = typeof body.password === "string" ? body.password : "";
  if (!validEmail(email) || !validRole(role) || password.length < 12 || password.length > 128) {
    return NextResponse.json({error:"تحقق من البريد والدور وكلمة المرور (12 حرفًا على الأقل)."}, {status:400});
  }
  if (!canManageRole(actor.role, role)) return forbidden();
  const db = await getPlayNovaDb();
  const existing = await db.prepare("SELECT email FROM admin_users WHERE email = ?").bind(email).first<{email:string}>();
  if (existing) return NextResponse.json({error:"هذا البريد مسجل بالفعل."},{status:409});
  const hash = await hashAdminPassword(password);
  await db.prepare("INSERT INTO admin_users (email, role, active, password_hash) VALUES (?, ?, 1, ?)").bind(email, role, hash).run();
  await db.prepare("INSERT INTO admin_audit_log_v2 (actor_email, actor_role, action, entity_type, entity_id, details_json) VALUES (?, ?, 'admin_created', 'admin_user', ?, ?)")
    .bind(actor.email, actor.role, email, JSON.stringify({role})).run();
  return NextResponse.json({ok:true}, {status:201, headers:{"Cache-Control":"no-store"}});
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return forbidden();
  let actor;
  try { actor = await requireAdmin("administrator"); } catch { return forbidden(); }
  let body: {email?:unknown; role?:unknown; active?:unknown};
  try { body = await request.json(); } catch { return NextResponse.json({error:"بيانات غير صالحة."},{status:400}); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!validEmail(email) || (body.role === undefined && typeof body.active !== "boolean") ||
      (body.role !== undefined && !validRole(body.role))) {
    return NextResponse.json({error:"بيانات التعديل غير صالحة."},{status:400});
  }
  const db = await getPlayNovaDb();
  const target = await db.prepare("SELECT email, role, active FROM admin_users WHERE email = ?").bind(email)
    .first<{email:string;role:AdminRole;active:number}>();
  if (!target) return NextResponse.json({error:"الحساب غير موجود."},{status:404});
  if (!canManageRole(actor.role, target.role) || (body.role !== undefined && !canManageRole(actor.role, body.role))) return forbidden();
  if (email === actor.email.toLowerCase() && body.active === false) {
    return NextResponse.json({error:"لا يمكنك تعطيل حسابك الحالي."},{status:400});
  }
  if (target.role === "owner" && (body.active === false || (body.role !== undefined && body.role !== "owner"))) {
    const owners = await db.prepare("SELECT COUNT(*) AS total FROM admin_users WHERE role = 'owner' AND active = 1").first<{total:number}>();
    if ((owners?.total ?? 0) <= 1) return NextResponse.json({error:"يجب الاحتفاظ بمالك نشط واحد على الأقل."},{status:400});
  }
  const nextRole = body.role as AdminRole | undefined;
  const nextActive = body.active as boolean | undefined;
  await db.prepare("UPDATE admin_users SET role = COALESCE(?, role), active = COALESCE(?, active), updated_at = CURRENT_TIMESTAMP WHERE email = ?")
    .bind(nextRole ?? null, nextActive === undefined ? null : nextActive ? 1 : 0, email).run();
  await db.prepare("INSERT INTO admin_audit_log_v2 (actor_email, actor_role, action, entity_type, entity_id, details_json) VALUES (?, ?, 'admin_updated', 'admin_user', ?, ?)")
    .bind(actor.email, actor.role, email, JSON.stringify({role: nextRole ?? target.role, active: nextActive ?? Boolean(target.active)})).run();
  return NextResponse.json({ok:true}, {headers:{"Cache-Control":"no-store"}});
}
