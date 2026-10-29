"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Gamepad2, Globe2, Search, Sparkles, Zap, Menu, X,
  Heart, Clock3, Compass, ShieldCheck
} from "lucide-react";

type Locale = "ar" | "en";

const games = [
  { id: "world", title: { ar: "عالم الألعاب", en: "Game Universe" }, subtitle: { ar: "اكتشف مغامرتك القادمة", en: "Discover your next adventure" }, category: "adventure", icon: "✦", tone: "from-violet-500/35 via-indigo-500/20 to-slate-950" },
  { id: "puzzle", title: { ar: "تحديات الذكاء", en: "Mind Challenges" }, subtitle: { ar: "اختبر مهاراتك", en: "Put your skills to the test" }, category: "puzzle", icon: "◇", tone: "from-cyan-400/30 via-blue-500/20 to-slate-950" },
  { id: "speed", title: { ar: "سرعة وحماس", en: "Speed & Thrills" }, subtitle: { ar: "استعد وانطلق", en: "Ready, set, go" }, category: "racing", icon: "⚡", tone: "from-fuchsia-500/30 via-purple-500/20 to-slate-950" },
];

const categories = [
  { id: "all", ar: "الكل", en: "All games" },
  { id: "action", ar: "أكشن", en: "Action" },
  { id: "puzzle", ar: "ألغاز", en: "Puzzle" },
  { id: "racing", ar: "سباق", en: "Racing" },
  { id: "sports", ar: "رياضة", en: "Sports" },
  { id: "adventure", ar: "مغامرات", en: "Adventure" },
];

const copy = {
  ar: {
    tagline: "عالمك. لعبتك. مغامرتك.", navDiscover: "اكتشف الألعاب", navCategories: "التصنيفات", navAbout: "عن PlayNova",
    heroEyebrow: "مساحة جديدة للعب والاكتشاف", heroTitle: "لعبتك القادمة", heroAccent: "على بُعد نقرة.",
    heroText: "اكتشف تجارب ألعاب متنوعة من مكان واحد. نبني PlayNova لتكون وجهتك الجديدة لألعاب المتصفح.",
    explore: "استكشف المنصة", categoriesEyebrow: "اختر أسلوبك", categoriesTitle: "تصفّح التصنيفات",
    discoverEyebrow: "ابدأ رحلتك", discoverTitle: "اكتشف PlayNova", search: "ابحث عن لعبة...",
    coming: "قريبًا", honest: "هذه معاينة للمنصة — الألعاب القابلة للتشغيل ستُضاف بعد التحقق من مصادرها وأذونات استخدامها.",
    aboutTitle: "نبدأ صغيرًا، ونبني للمستقبل.", aboutText: "PlayNova قيد التطوير. سنضيف الألعاب بعد التحقق من مصادرها وأذونات استخدامها، مع الاهتمام بالأداء وتجربة اللعب على مختلف الأجهزة.",
    foundation: "النسخة التأسيسية", footer: "مصممة بحب لعشاق ألعاب المتصفح.", empty: "لا توجد نتائج مطابقة. جرّب كلمة بحث أو تصنيفًا آخر.",
    noGames: "محتوى تجريبي", favorites: "المفضلة", recent: "شوهدت مؤخرًا", legal: "روابط مهمة", privacy: "الخصوصية", terms: "الشروط", contact: "تواصل معنا",
    searchLabel: "ابحث في الألعاب", menu: "القائمة", categoriesAll: "كل التصنيفات"
  },
  en: {
    tagline: "Your world. Your game. Your adventure.", navDiscover: "Discover", navCategories: "Categories", navAbout: "About",
    heroEyebrow: "A new space to play and explore", heroTitle: "Your next game", heroAccent: "is one click away.",
    heroText: "Discover a variety of gaming experiences in one place. PlayNova is being built as your new browser gaming destination.",
    explore: "Explore PlayNova", categoriesEyebrow: "Choose your style", categoriesTitle: "Browse categories",
    discoverEyebrow: "Start your journey", discoverTitle: "Discover PlayNova", search: "Search games...",
    coming: "Coming soon", honest: "Platform preview — playable games will be added after their sources and usage permissions are verified.",
    aboutTitle: "Starting small. Building for more.", aboutText: "PlayNova is in development. Games will be added only after checking their sources and permissions, with a focus on performance and a great experience across devices.",
    foundation: "Foundation release", footer: "Made for browser gaming fans.", empty: "No matching results. Try another search or category.",
    noGames: "Preview content", favorites: "Favorites", recent: "Recently viewed", legal: "Useful links", privacy: "Privacy", terms: "Terms", contact: "Contact",
    searchLabel: "Search games", menu: "Menu", categoriesAll: "All categories"
  }
};

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("ar");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = copy[locale];
  const isArabic = locale === "ar";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [locale, isArabic]);

  const visibleGames = useMemo(() => games.filter((game) => {
    const matchesCategory = activeCategory === "all" || game.category === activeCategory;
    const searchable = `${game.title[locale]} ${game.subtitle[locale]}`.toLocaleLowerCase();
    return matchesCategory && searchable.includes(query.trim().toLocaleLowerCase());
  }), [activeCategory, locale, query]);

  return (
    <main className="min-h-screen overflow-hidden pb-12">
      <header className="site-header">
        <div className="container flex min-h-[82px] items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="PlayNova home">
            <span className="nova-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow">
              <Gamepad2 size={24} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">Play<span className="text-violet-300">Nova</span></span>
              <span className="block text-[11px] text-violet-200/55">{t.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-violet-100/70 md:flex" aria-label="Main navigation">
            <a className="nav-link" href="#discover">{t.navDiscover}</a>
            <a className="nav-link" href="#categories">{t.navCategories}</a>
            <a className="nav-link" href="#about">{t.navAbout}</a>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" className="language-button" onClick={() => setLocale(isArabic ? "en" : "ar")} aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}>
              <Globe2 size={17} /><span>{isArabic ? "EN" : "عربي"}</span>
            </button>
            <button type="button" className="icon-button md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label={t.menu}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="container mobile-menu md:hidden" aria-label="Mobile navigation">
            <a href="#discover" onClick={() => setMobileMenuOpen(false)}>{t.navDiscover}</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)}>{t.navCategories}</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>{t.navAbout}</a>
          </nav>
        )}
      </header>

      <section className="container pt-8 md:pt-12">
        <div className="hero-panel relative overflow-hidden rounded-[2rem] px-6 py-12 md:px-14 md:py-16">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="relative z-10 max-w-2xl">
            <span className="eyebrow mb-5 inline-flex items-center gap-2">
              <Sparkles size={14} /> {t.heroEyebrow}
            </span>
            <h1 className="text-4xl font-black leading-[1.2] tracking-tight sm:text-5xl md:text-6xl">
              {t.heroTitle}
              <span className="mt-2 block bg-gradient-to-l from-violet-200 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">{t.heroAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-violet-100/65 md:text-lg">{t.heroText}</p>
            <a href="#discover" className="primary-button mt-8 inline-flex items-center gap-2">
              {t.explore} <ArrowLeft size={18} className={isArabic ? "" : "rotate-180"} />
            </a>
          </div>
          <div className="hero-art pointer-events-none absolute bottom-0 left-0 hidden h-full w-[38%] items-center justify-center md:flex" aria-hidden="true">
            <div className="relative flex h-64 w-64 rotate-[-8deg] items-center justify-center rounded-[3rem] border border-violet-200/20 bg-violet-400/5">
              <div className="absolute inset-5 rounded-[2.4rem] border border-fuchsia-300/20" />
              <Gamepad2 size={112} strokeWidth={1.1} className="text-violet-200 drop-shadow-[0_0_28px_rgba(167,139,250,0.5)]" />
              <span className="absolute -right-4 top-7 rounded-xl bg-fuchsia-400/15 p-3 text-fuchsia-200"><Zap size={24} /></span>
              <span className="absolute -bottom-3 -left-3 rounded-xl bg-violet-400/15 p-3 text-violet-200"><Sparkles size={22} /></span>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container pt-12">
        <div className="mb-5">
          <p className="section-kicker">{t.categoriesEyebrow}</p>
          <h2 className="section-title">{t.categoriesTitle}</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3" role="group" aria-label={t.categoriesAll}>
          {categories.map((category) => (
            <button key={category.id} type="button" aria-pressed={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              className={activeCategory === category.id ? "category-chip category-chip-active" : "category-chip"}>
              {category[locale]}
            </button>
          ))}
        </div>
      </section>

      <section id="discover" className="container pt-9">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">{t.discoverEyebrow}</p>
            <h2 className="section-title">{t.discoverTitle}</h2>
          </div>
          <label className="search-field">
            <Search size={18} className="shrink-0 text-violet-200/55" />
            <span className="sr-only">{t.searchLabel}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} type="search" />
            {query && <button type="button" onClick={() => setQuery("")} className="text-xs text-violet-200/70 hover:text-white">×</button>}
          </label>
        </div>

        {visibleGames.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGames.map((game) => (
              <article key={game.id} className="game-card group">
                <div className={`game-art relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br ${game.tone}`}>
                  <span className="game-art-glow" />
                  <span className="relative text-6xl text-violet-100/85 transition duration-300 group-hover:scale-110">{game.icon}</span>
                  <span className="absolute end-3 top-3 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-violet-100/80">{t.coming}</span>
                  <span className="absolute start-3 bottom-3 rounded-lg bg-black/25 p-2 text-violet-100/75"><Gamepad2 size={18} /></span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{game.title[locale]}</h3>
                  <p className="mt-1 text-sm text-violet-100/55">{game.subtitle[locale]}</p>
                  <p className="mt-4 text-xs text-violet-300/70">{t.noGames}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={26} className="mx-auto mb-3 text-violet-300/70" />
            <p>{t.empty}</p>
          </div>
        )}
        <p className="mt-4 text-xs leading-6 text-violet-100/40">{t.honest}</p>
      </section>

      <section className="container pt-12">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="feature-tile"><Compass size={20} /><span>{t.navDiscover}</span></div>
          <div className="feature-tile"><Heart size={20} /><span>{t.favorites}</span><small>{t.coming}</small></div>
          <div className="feature-tile"><Clock3 size={20} /><span>{t.recent}</span><small>{t.coming}</small></div>
        </div>
      </section>

      <section id="about" className="container pt-12">
        <div className="about-panel flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-extrabold">{t.aboutTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-violet-100/60">{t.aboutText}</p>
          </div>
          <span className="eyebrow inline-flex shrink-0 items-center gap-2 self-start md:self-auto"><ShieldCheck size={15} /> {t.foundation}</span>
        </div>
      </section>

      <footer className="container mt-14 border-t border-white/10 pt-7 text-sm text-violet-100/45">
        <div className="flex flex-col justify-between gap-5 sm:flex-row">
          <div><p className="font-bold text-white">Play<span className="text-violet-300">Nova</span></p><p className="mt-1">{t.footer}</p></div>
          <div><p className="mb-2 font-semibold text-violet-100/70">{t.legal}</p><div className="flex flex-wrap gap-4"><span>{t.privacy}</span><span>{t.terms}</span><span>{t.contact}</span></div></div>
          <p>© {new Date().getFullYear()} PlayNova.</p>
        </div>
      </footer>
    </main>
  );
}
