import Link from "next/link";
import { getAdminIdentity } from "@/lib/admin-auth";
import AdminLogoutButton from "./logout-button";
import { getPlayNovaDb } from "@/lib/db";

type CountRow = { total: number };
type EventRow = { starts: number; failures: number; successes: number };
type ActivityRow = { actor_email: string; actor_role: string; action: string; entity_type: string; entity_id: string | null; created_at: string };

function validDate(value: string | undefined): string | null {
  if (!value || !new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$").test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

export const dynamic = "force-dynamic";

export default async function AdminOverview({ searchParams }: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const admin = await getAdminIdentity();
  if (!admin) {
    return <main className="admin-shell"><section className="admin-card"><h1>الوصول مرفوض</h1><p>سجّل الدخول إلى لوحة الإدارة للمتابعة. <a href="/admin/login">تسجيل الدخول</a></p></section></main>;
  }

  const query = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const from = validDate(query.from) ?? defaultFrom;
  const to = validDate(query.to) ?? today;
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  const endExclusive = new Date(new Date(end + "T00:00:00Z").getTime() + 86400000).toISOString();

  const db = await getPlayNovaDb();
  const [published, drafts, review, events, activity] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS total FROM games WHERE status = 'published' AND moderation_status = 'active' AND license_status = 'approved'").first<CountRow>(),
    db.prepare("SELECT COUNT(*) AS total FROM games WHERE status = 'draft'").first<CountRow>(),
    db.prepare("SELECT COUNT(*) AS total FROM games WHERE review_status IN ('pending','not_submitted') AND status != 'published'").first<CountRow>(),
    db.prepare(`SELECT
      SUM(CASE WHEN event_type = 'start' THEN 1 ELSE 0 END) AS starts,
      SUM(CASE WHEN event_type = 'load_failure' THEN 1 ELSE 0 END) AS failures,
      SUM(CASE WHEN event_type = 'load_success' THEN 1 ELSE 0 END) AS successes
      FROM play_events WHERE created_at >= ? AND created_at < ?`).bind(start, endExclusive).first<EventRow>(),
    db.prepare("SELECT actor_email, actor_role, action, entity_type, entity_id, created_at FROM admin_audit_log_v2 ORDER BY created_at DESC LIMIT 12").all<ActivityRow>(),
  ]);

  const cards = [
    ["الألعاب المنشورة", published?.total ?? 0],
    ["المسودات", drafts?.total ?? 0],
    ["بانتظار المراجعة", review?.total ?? 0],
    ["مرات بدء اللعب", events?.starts ?? 0],
    ["نجاح التحميل المسجل", events?.successes ?? 0],
    ["إخفاقات التحميل المسجلة", events?.failures ?? 0],
  ];

  return (
    <main className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">Play<span>Nova</span><small>لوحة الإدارة</small></Link>
        <nav>
          <Link className="active" href="/admin">نظرة عامة</Link>
          <Link href="/admin/analytics">التحليلات والأداء</Link>
          {(admin.role === "owner" || admin.role === "administrator") && <Link href="/admin/monetization">الإعلانات وتحقيق الأرباح</Link>}
          <Link href="/admin/games">إدارة الألعاب</Link>
          <Link href="/admin/categories">التصنيفات</Link>
          <Link href="/admin/assets">الملفات والأصول</Link>
          {(admin.role === "owner" || admin.role === "administrator") && <Link href="/admin/providers">مزودو الألعاب</Link>}
          <Link href="/admin/licenses">التراخيص والحقوق</Link>
          <Link href="/admin/homepage">الصفحة الرئيسية</Link>
          <Link href="/admin/reports">البلاغات والإشراف</Link>
          <Link href="/admin/settings">الإعدادات</Link>
          {(admin.role === "owner" || admin.role === "administrator") && <Link href="/admin/users">إدارة المشرفين</Link>}
        </nav>
        <div className="admin-session"><span>{admin.email}</span><small>{admin.role}</small></div>
      </aside>
      <section className="admin-main">
        <header className="admin-heading">
          <div><p className="admin-eyebrow">PLAYNOVA CONTROL CENTER</p><h1>نظرة عامة</h1><p>بيانات مباشرة من قاعدة D1 وسجل الأحداث الفعلي.</p></div>
          <div style={{ display: "flex", gap: 10 }}><Link href="/" className="admin-secondary">عرض الموقع</Link><AdminLogoutButton /></div>
        </header>
        <form className="admin-filter" method="get">
          <label>من <input type="date" name="from" defaultValue={start} /></label>
          <label>إلى <input type="date" name="to" defaultValue={end} /></label>
          <button type="submit">تطبيق الفترة</button>
        </form>
        <div className="admin-metrics">
          {cards.map(([label, value]) => <article className="admin-metric" key={label}><span>{label}</span><strong>{Number(value).toLocaleString("en-US")}</strong></article>)}
        </div>
        <section className="admin-card">
          <div className="admin-card-heading"><div><h2>النشاط الإداري الأخير</h2><p>آخر 12 تغييرًا مسجلًا في سجل التدقيق.</p></div></div>
          {activity.results.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>المستخدم</th><th>الدور</th><th>الإجراء</th><th>العنصر</th><th>التاريخ</th></tr></thead><tbody>{activity.results.map((item) => <tr key={item.actor_email + item.created_at + item.action}><td>{item.actor_email}</td><td>{item.actor_role}</td><td>{item.action}</td><td>{item.entity_type}{item.entity_id ? ` · ${item.entity_id}` : ""}</td><td>{item.created_at}</td></tr>)}</tbody></table></div> : <p className="admin-empty">لا توجد أنشطة إدارية مسجلة حتى الآن.</p>}
        </section>
        <p className="admin-footnote">الفترة المختارة: {start} — {end}. لا تُعرض أرقام تقديرية؛ الأحداث لا تظهر إلا بعد ربط نقاط التسجيل الفعلية.</p>
      </section>
    </main>
  );
}
