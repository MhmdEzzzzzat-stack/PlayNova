import { ArrowLeft, Gamepad2, Globe2, Search, Sparkles, Zap } from "lucide-react";

const categories = ["الكل", "أكشن", "ألغاز", "سباق", "رياضة", "مغامرات"];

const featured = [
  { title: "عالم الألعاب", subtitle: "اكتشف مغامرتك القادمة", icon: "✦" },
  { title: "تحديات الذكاء", subtitle: "اختبر مهاراتك", icon: "◇" },
  { title: "سرعة وحماس", subtitle: "استعد وانطلق", icon: "⚡" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen pb-16">
      <header className="container flex items-center justify-between gap-4 py-6">
        <a href="/" className="flex items-center gap-3" aria-label="PlayNova الصفحة الرئيسية">
          <span className="nova-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow">
            <Gamepad2 size={24} />
          </span>
          <span>
            <span className="block text-xl font-black tracking-tight">Play<span className="text-violet-300">Nova</span></span>
            <span className="block text-xs text-violet-200/60">عالمك. لعبتك. مغامرتك.</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-violet-100/70 md:flex" aria-label="التنقل الرئيسي">
          <a className="transition hover:text-white" href="#discover">اكتشف الألعاب</a>
          <a className="transition hover:text-white" href="#categories">التصنيفات</a>
          <a className="transition hover:text-white" href="#about">عن PlayNova</a>
        </nav>
        <button type="button" className="panel flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-violet-100">
          <Globe2 size={17} />
          <span>العربية</span>
        </button>
      </header>

      <section className="container pt-10 md:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-300/15 bg-[#15112b]/90 px-6 py-12 shadow-glow md:px-14 md:py-16">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <Sparkles size={14} /> مساحة جديدة للعب والاكتشاف
            </span>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              لعبتك القادمة
              <span className="mt-2 block bg-gradient-to-l from-violet-200 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">على بُعد نقرة.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-violet-100/65 md:text-lg">
              اكتشف تجارب ألعاب متنوعة من مكان واحد. نبني PlayNova لتكون وجهتك الجديدة لألعاب المتصفح.
            </p>
            <a href="#discover" className="nova-gradient mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white shadow-glow transition hover:-translate-y-0.5">
              استكشف المنصة <ArrowLeft size={18} />
            </a>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 hidden h-full w-[38%] items-center justify-center md:flex" aria-hidden="true">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-[3rem] border border-violet-200/20 bg-violet-400/5 rotate-[-8deg]">
              <div className="absolute inset-5 rounded-[2.4rem] border border-fuchsia-300/20" />
              <Gamepad2 size={112} strokeWidth={1.1} className="text-violet-200 drop-shadow-[0_0_28px_rgba(167,139,250,0.5)]" />
              <span className="absolute -right-4 top-7 rounded-xl bg-fuchsia-400/15 p-3 text-fuchsia-200"><Zap size={24} /></span>
              <span className="absolute -bottom-3 -left-3 rounded-xl bg-violet-400/15 p-3 text-violet-200"><Sparkles size={22} /></span>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container pt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-300">اختر أسلوبك</p>
            <h2 className="mt-1 text-2xl font-extrabold">تصفّح التصنيفات</h2>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button key={category} type="button" className={index === 0 ? "shrink-0 rounded-full bg-violet-300 px-5 py-2.5 text-sm font-bold text-[#17102b]" : "panel shrink-0 rounded-full px-5 py-2.5 text-sm text-violet-100/80 transition hover:border-violet-300/40 hover:text-white"}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section id="discover" className="container pt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-300">ابدأ رحلتك</p>
            <h2 className="mt-1 text-2xl font-extrabold">اكتشف PlayNova</h2>
          </div>
          <div className="panel flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-violet-100/45">
            <Search size={17} />
            <span>البحث عن الألعاب — قريبًا</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, index) => (
            <article key={item.title} className="panel group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-violet-300/30">
              <div className="game-placeholder relative flex aspect-[16/9] items-center justify-center overflow-hidden">
                <span className="text-6xl text-violet-100/80 transition duration-300 group-hover:scale-110">{item.icon}</span>
                <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-violet-100/70">قريبًا</span>
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/25 p-2 text-violet-100/70"><Gamepad2 size={18} /></span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-violet-100/55">{item.subtitle}</p>
                <p className="mt-4 text-xs text-violet-300/70">سيتم إضافة ألعاب قابلة للتشغيل بعد تجهيز الكتالوج.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="container pt-14">
        <div className="panel flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-extrabold">نبدأ صغيرًا، ونبني للمستقبل.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-violet-100/60">PlayNova قيد التطوير. سنضيف الألعاب بعد التحقق من مصادرها وأذونات استخدامها، مع الاهتمام بالأداء وتجربة اللعب على مختلف الأجهزة.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs font-semibold text-violet-200 md:self-auto">
            <Sparkles size={15} /> النسخة التأسيسية
          </span>
        </div>
      </section>

      <footer className="container mt-14 border-t border-white/10 pt-6 text-sm text-violet-100/40">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} PlayNova. جميع الحقوق محفوظة.</p>
          <p>مصممة بحب لعشاق ألعاب المتصفح.</p>
        </div>
      </footer>
    </main>
  );
}
