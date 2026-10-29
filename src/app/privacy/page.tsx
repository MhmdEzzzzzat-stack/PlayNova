import Link from "next/link";
import { getLocale } from "@/lib/categories";

export const metadata = { title: "Privacy | PlayNova", description: "How PlayNova stores local preferences and handles data." };

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  return <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}><div className="directory-container">
    <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}><Link href={`/?lang=${locale}`}>{ar ? "الرئيسية" : "Home"}</Link><span>/</span><span>{ar ? "الخصوصية" : "Privacy"}</span></nav>
    <p className="directory-kicker">PlayNova</p><h1>{ar ? "الخصوصية والتحكم في بياناتك" : "Privacy and your data"}</h1>
    {ar ? <>
      <h2>ما الذي يُحفظ على جهازك؟</h2><p>يمكن حفظ اللغة المفضلة وقائمة الألعاب المفضلة وسجل الألعاب التي تم تحميل إطارها في التخزين المحلي للمتصفح. سجل التشغيل محدود بآخر 20 لعبة ويحتوي على معرّف اللعبة ووقت التحميل فقط.</p>
      <h2>ما الذي يُرسل إلى الخادم؟</h2><p>لا تُرسل المفضلة أو سجل التشغيل إلى خادم PlayNova حاليًا، ولا توجد مزامنة بين الأجهزة أو حسابات مستخدمين مفعّلة ضمن هذه المزايا.</p>
      <h2>كيف تمسح بياناتك؟</h2><p>يمكنك إزالة الألعاب من صفحة المفضلة ومسح سجل التشغيل من صفحته، أو حذف بيانات الموقع من إعدادات المتصفح. قد تتأثر بعض التفضيلات عند استخدام التصفح الخاص أو حظر التخزين المحلي.</p>
      <h2>التحليلات والتتبع</h2><p>تعمل تحليلات PlayNova فقط بعد موافقتك الصريحة من نافذة إعدادات الخصوصية أسفل الشاشة. عند الموافقة قد نسجل مشاهدات صفحات الألعاب وعمليات البحث والتصنيفات ومحاولات بدء اللعبة وإشارات تحميل إطار اللعبة والمفضلة ومؤشرات الأداء ونوع الجهاز ومضيف الإحالة الخارجي. نستخدم معرّفًا عشوائيًا للمتصفح ونخزن بصمته المشفرة فقط. لا نسجل عنوان IP أو البريد أو كلمات المرور أو رموز الدخول أو نصوص أخطاء حساسة. عبارات البحث قد تُخزن لتحسين الكتالوج. يمكنك سحب الموافقة من زر الخصوصية في أي وقت. مدة الاحتفاظ المستهدفة 90 يومًا. لا نبيع هذه البيانات ولا نستخدمها لإثبات عدد لاعبين فعليين أو إيرادات.</p><h2>سجلات الأعطال</h2><p>قد تُسجل أخطاء الخادم في سجلات Cloudflare التشغيلية مع اسم الخطأ والمسار دون معاملات الرابط أو تفاصيل حساسة، وفق إعدادات احتفاظ مزود الاستضافة.</p>
    </> : <>
      <h2>What is stored on your device?</h2><p>Your preferred language, favorites, and a list of games whose game frames loaded may be saved in browser local storage. Recent history is limited to 20 entries and stores only a game identifier and launch time.</p>
      <h2>What is sent to the server?</h2><p>Favorites and recent history are not sent to PlayNova servers. User accounts and cross-device synchronization are not enabled for these features.</p>
      <h2>How can you clear your data?</h2><p>Remove individual games from Favorites, clear Recent History on its page, or clear site data in your browser settings. Private browsing or storage restrictions may affect persistence.</p>
      <h2>Analytics and tracking</h2><p>PlayNova analytics runs only after you explicitly opt in through the privacy settings prompt. If you consent, we may record game detail views, searches, category visits, game-start attempts, iframe load signals, favorite actions, performance metrics, device class, and external referring hostname. We use a random browser identifier and store only its SHA-256 hash. We do not store IP addresses, email addresses, passwords, authentication tokens, or sensitive error text. Search terms may be stored to improve the catalog. You can withdraw consent at any time using the Privacy control at the bottom of the screen. The target retention period is 90 days. Analytics are not sold and must not be interpreted as verified player counts or revenue.</p><h2>Error logs</h2><p>Server request errors may be recorded in Cloudflare operational logs with the error name and route path, excluding URL query parameters and sensitive details, subject to the hosting provider retention settings.</p>
    </>}
    <p><Link href={`/favorites?lang=${locale}`}>{ar ? "إدارة المفضلة" : "Manage favorites"}</Link> · <Link href={`/recent?lang=${locale}`}>{ar ? "إدارة سجل التشغيل" : "Manage recent history"}</Link></p>
  </div></main>;
}
