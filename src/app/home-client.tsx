"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Gamepad2, Globe2, Search, Sparkles, Menu, X, Heart, Clock3,
  ShieldCheck, ArrowLeft, Car, Trophy, Swords, Mountain, Puzzle,
  Users, Box, Star, Flame
} from "lucide-react";

type Locale = "ar" | "en";
type Category = { id: string; ar: string; en: string; icon: typeof Gamepad2 };
type Game = {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  category: string;
  categoryName: Record<Locale, string>;
  thumbnail?: string;
  publishedAt: string;
  featured?: boolean;
  popularity?: number;
};

const categoryStyles: Category[] = [
  { id: "racing", ar: "سباق", en: "Racing", icon: Car },
  { id: "football", ar: "كرة القدم", en: "Football", icon: Trophy },
  { id: "sports", ar: "رياضة", en: "Sports", icon: Trophy },
  { id: "action", ar: "أكشن", en: "Action", icon: Swords },
  { id: "strategy", ar: "استراتيجية", en: "Strategy", icon: Trophy },
  { id: "adventure", ar: "مغامرات", en: "Adventure", icon: Mountain },
  { id: "puzzle", ar: "ألغاز", en: "Puzzle", icon: Puzzle },
  { id: "shooting", ar: "تصويب", en: "Shooting", icon: Swords },
  { id: "multiplayer", ar: "متعددة اللاعبين", en: "Multiplayer", icon: Users },
  { id: "two-player", ar: "لاعبان", en: "Two Player", icon: Users },
  { id: "simulation", ar: "محاكاة", en: "Simulation", icon: Box },
  { id: "horror", ar: "رعب", en: "Horror", icon: Flame },
  { id: "casual", ar: "خفيفة", en: "Casual", icon: Sparkles },
  { id: "idle", ar: "خمولية", en: "Idle", icon: Clock3 },
  { id: "platformer", ar: "منصات", en: "Platformer", icon: Mountain },
  { id: "3d-games", ar: "ألعاب ثلاثية الأبعاد", en: "3D Games", icon: Box },
];

const copy = {
  ar: {
    tagline: "عالمك. لعبتك. مغامرتك.", discover: "اكتشف", categories: "التصنيفات", about: "عن PlayNova",
    eyebrow: "مساحة جديدة للعب والاكتشاف", title: "لعبتك القادمة", accent: "تبدأ من هنا.",
    intro: "اكتشف ألعاب متصفح متنوعة من مكان واحد. نعمل على بناء تجربة لعب سهلة وسريعة على كل أجهزتك.",
    explore: "استكشف الألعاب", browse: "تصفّح حسب النوع", all: "كل الألعاب",
    featured: "ألعاب مختارة", popular: "الأكثر لعبًا", newest: "أحدث الألعاب",
    recently: "تابع من حيث توقفت", recommended: "قد تعجبك", search: "ابحث عن لعبة أو تصنيف...",
    empty: "لا توجد ألعاب منشورة في هذا القسم حاليًا.", emptySearch: "لم نعثر على ألعاب تطابق بحثك.",
    catalogNote: "سيظهر هنا محتوى الألعاب بعد ربط كتالوج الألعاب المنشورة والتحقق من صلاحية تشغيلها.",
    aboutTitle: "منصة ألعاب تُبنى بعناية.", aboutText: "PlayNova مشروع قيد التطوير. نضيف الألعاب بعد التحقق من مصادرها وأذونات استخدامها، ونهتم بتجربة سلسة وآمنة.",
    contact: "تواصل معنا", privacy: "الخصوصية", terms: "الشروط", copyright: "الإبلاغ عن حقوق النشر",
    useful: "روابط مهمة", footer: "مصممة لعشاق ألعاب المتصفح.", language: "تغيير اللغة",
    menu: "فتح القائمة", favorites: "إضافة للمفضلة", noFavorites: "سجّل ألعابك المفضلة بعد توفر الكتالوج.",
    noRecent: "الألعاب التي تلعبها ستظهر هنا.", recommendedRule: "اقتراحات مبنية على التصنيف وسجل اللعب، بعد توفر بيانات الألعاب.",
    coming: "قريبًا", status: "الكتالوج قيد التجهيز", loading: "جارٍ تحميل الألعاب..."
  },
  en: {
    tagline: "Your world. Your game. Your adventure.", discover: "Discover", categories: "Categories", about: "About PlayNova",
    eyebrow: "A new space to play and explore", title: "Your next game", accent: "starts right here.",
    intro: "Discover browser games in one place. We're building a smooth, accessible gaming experience for all your devices.",
    explore: "Explore games", browse: "Browse by genre", all: "All games",
    featured: "Featured games", popular: "Most played", newest: "New games",
    recently: "Pick up where you left off", recommended: "Recommended for you", search: "Search games or genres...",
    empty: "There are no published games in this section yet.", emptySearch: "No games match your search.",
    catalogNote: "Games will appear here once the published catalog is connected and each game's permission to run is verified.",
    aboutTitle: "A gaming platform, built with care.", aboutText: "PlayNova is in development. Games are added only after checking their sources and permissions, with a focus on a smooth and safe experience.",
    contact: "Contact", privacy: "Privacy", terms: "Terms", copyright: "Copyright reporting",
    useful: "Useful links", footer: "Made for browser gaming fans.", language: "Change language",
    menu: "Open menu", favorites: "Add to favorites", noFavorites: "Your saved games will appear here once the catalog is available.",
    noRecent: "Games you play will appear here.", recommendedRule: "Suggestions will use genres and play history once game data is available.",
    coming: "Coming soon", status: "Catalog in preparation", loading: "Loading games..."
  }
};

function GameSection({
  title, subtitle, locale, games, empty, onFavorite, favorites
}: {
  title: string; subtitle?: string; locale: Locale; games: Game[]; empty: string;
  onFavorite: (id: string) => void; favorites: string[];
}) {
  return (
    <section className="container section-space">
      <div className="section-heading">
        <div><p className="section-kicker">{subtitle}</p><h2 className="section-title">{title}</h2></div>
        <span className="section-count">{games.length}</span>
      </div>
      {games.length === 0 ? (
        <div className="catalog-empty"><Gamepad2 size={25} /><p>{empty}</p></div>
      ) : (
        <div className="game-grid">
          {games.map((game) => (
            <article key={game.id} className="game-card">
              <Link href={`/games/${game.slug}?lang=${locale}`} className="game-card-link" aria-label={game.title[locale]}>
                <div className="game-thumb">
                  {game.thumbnail ? <Image src={game.thumbnail} alt={game.title[locale]} fill sizes="(max-width: 640px) 50vw, 25vw" loading="lazy" unoptimized /> : <Gamepad2 size={42} />}
                  <span className="game-category">{game.categoryName[locale]}</span>
                </div>
                <div className="game-card-copy"><h3>{game.title[locale]}</h3><span>{game.categoryName[locale]}</span></div>
              </Link>
              <button type="button" className="favorite-button" onClick={() => onFavorite(game.id)} aria-label={`${locale === "ar" ? "تبديل المفضلة" : "Toggle favorite"}: ${game.title[locale]}`} aria-pressed={favorites.includes(game.id)}>
                <Heart size={17} fill={favorites.includes(game.id) ? "currentColor" : "none"} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage({ initialLocale = "ar", games = [], availableCategories = [] }: {
  initialLocale?: Locale;
  games?: Game[];
  availableCategories?: { slug: string; name: Record<Locale, string> }[];
}) {
  const publishedGames = games;
  const categories: Category[] = availableCategories.map((item) => ({
    id: item.slug,
    ar: item.name.ar,
    en: item.name.en,
    icon: categoryStyles.find((style) => style.id === item.slug)?.icon ?? Gamepad2,
  }));
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [query, setQuery] = useState("");
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const t = copy[locale];
  const isArabic = locale === "ar";

  useEffect(() => {
    try {
      const requestedLocale = new URLSearchParams(window.location.search).get("lang");
      const savedLocale = localStorage.getItem("playnova-locale");
      if (requestedLocale === "ar" || requestedLocale === "en") setLocale(requestedLocale);
      else if (savedLocale === "ar" || savedLocale === "en") setLocale(savedLocale);
      setFavorites(JSON.parse(localStorage.getItem("playnova-favorites") || "[]"));
      setRecent(JSON.parse(localStorage.getItem("playnova-recent") || "[]"));
    } catch {
      setFavorites([]);
      setRecent([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    try { localStorage.setItem("playnova-locale", locale); } catch {}
  }, [locale, isArabic]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try { localStorage.setItem("playnova-favorites", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => publishedGames.filter((game) => {
    const matchesCategory = true;
    const term = query.trim().toLocaleLowerCase();
    return matchesCategory && (!term || `${game.title.ar} ${game.title.en} ${game.categoryName.ar} ${game.categoryName.en}`.toLocaleLowerCase().includes(term));
  }), [query, publishedGames]);

  const featured = filtered.filter((game) => game.featured);
  const popular = [...filtered].filter((game) => typeof game.popularity === "number").sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const newest = [...filtered].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const recentGames = recent.map((id) => publishedGames.find((game) => game.id === id)).filter((game): game is Game => Boolean(game));
  const recommended = [...filtered].filter((game) => !recent.includes(game.id)).slice(0, 8);

  const switchLocale = () => { const next = locale === "ar" ? "en" : "ar"; window.location.assign(`/?lang=${next}`); };

  return (
    <main className="min-h-screen overflow-hidden pb-12">
      <header className="site-header">
        <div className="container header-inner">
          <Link href={"/?lang=" + locale} className="brand" aria-label="PlayNova home">
            <span className="brand-mark"><Gamepad2 size={24} /></span>
            <span><strong>Play<span>Nova</span></strong><small>{t.tagline}</small></span>
          </Link>
          <nav className="desktop-nav" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
            <a href="#discover">{t.discover}</a><a href="#categories">{t.categories}</a><a href="#about">{t.about}</a>
          </nav>
          <div className="header-actions">
            <button type="button" className="language-button" onClick={switchLocale} aria-label={t.language}><Globe2 size={17} /><span>{isArabic ? "EN" : "عربي"}</span></button>
            <button type="button" className="menu-button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label={t.menu}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <nav className="mobile-nav container"><a href="#discover" onClick={() => setMenuOpen(false)}>{t.discover}</a><a href="#categories" onClick={() => setMenuOpen(false)}>{t.categories}</a><a href="#about" onClick={() => setMenuOpen(false)}>{t.about}</a></nav>}
      </header>

      <section className="container hero-wrap">
        <div className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} />{t.eyebrow}</span>
            <h1>{t.title}<span>{t.accent}</span></h1>
            <p>{t.intro}</p>
            <a className="primary-button" href="#discover">{t.explore}<ArrowLeft size={18} className={isArabic ? "" : "rotate-180"} /></a>
          </div>
          <div className="hero-graphic" aria-hidden="true"><div className="hero-console"><Gamepad2 size={108} strokeWidth={1.1} /></div><span className="hero-star"><Star /></span><span className="hero-flame"><Flame /></span></div>
        </div>
      </section>

      <section id="categories" className="container category-section">
        <div className="section-heading"><div><p className="section-kicker">{t.browse}</p><h2 className="section-title">{t.categories}</h2></div></div>
        <div className="category-list">
          <Link href={"/categories?lang=" + locale} className="category-chip">{t.all}</Link>
          {categories.map((item) => { const Icon = item.icon; return <Link key={item.id} href={"/categories/" + item.id + "?lang=" + locale} className="category-chip"><Icon size={16} />{item[locale]}</Link>; })}
        </div>
      </section>

      <section id="discover" className="container search-section">
        <form action="/search" method="get" className="search-field">
          <Search size={19} />
          <input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} type="search" aria-label={t.search} maxLength={100} />
          <input type="hidden" name="lang" value={locale} />
          <button type="submit" aria-label={isArabic ? "بحث" : "Search"}><kbd>⌕</kbd></button>
        </form>
        {!ready && <p className="loading-note">{t.loading}</p>}
        {ready && query && filtered.length === 0 && <p className="search-feedback">{t.emptySearch}</p>}
      </section>

      <GameSection title={t.featured} subtitle={t.status} locale={locale} games={featured} empty={t.empty} favorites={favorites} onFavorite={toggleFavorite} />
      <GameSection title={t.popular} subtitle={isArabic ? "حسب أحداث اللعب المسجلة" : "Based on recorded play events"} locale={locale} games={popular} empty={t.empty} favorites={favorites} onFavorite={toggleFavorite} />
      <GameSection title={t.newest} subtitle={isArabic ? "مرتبة بتاريخ النشر" : "Ordered by publication date"} locale={locale} games={newest} empty={t.empty} favorites={favorites} onFavorite={toggleFavorite} />
      <GameSection title={t.recently} subtitle={isArabic ? "سجل اللعب على هذا الجهاز" : "This device's play history"} locale={locale} games={recentGames} empty={t.noRecent} favorites={favorites} onFavorite={toggleFavorite} />
      <GameSection title={t.recommended} subtitle={t.recommendedRule} locale={locale} games={recommended} empty={t.empty} favorites={favorites} onFavorite={toggleFavorite} />

      <section className="container genre-section">
        {visibleCategories.map((item) => {
          const genreGames = filtered.filter((game) => game.category.toLowerCase() === item.id);
          return <GameSection key={item.id} title={item[locale]} subtitle={isArabic ? "تصفّح النوع" : "Explore this genre"} locale={locale} games={genreGames} empty={t.empty} favorites={favorites} onFavorite={toggleFavorite} />;
        })}
      </section>

      <section id="about" className="container about-section">
        <div className="about-panel"><div><span className="eyebrow"><ShieldCheck size={15} />PlayNova</span><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p></div><span className="about-badge"><Gamepad2 size={26} />{t.coming}</span></div>
      </section>

      <footer className="container site-footer">
        <div className="footer-brand"><strong>Play<span>Nova</span></strong><p>{t.footer}</p><small>© {new Date().getFullYear()} PlayNova.</small></div>
        <div className="footer-links"><h3>{t.useful}</h3><a href="#about">{t.about}</a><span>{t.contact} · {t.coming}</span><Link href={"/privacy?lang=" + locale}>{t.privacy}</Link><Link href={"/favorites?lang=" + locale}>{isArabic ? "المفضلة" : "Favorites"}</Link><Link href={"/recent?lang=" + locale}>{isArabic ? "تم تشغيلها مؤخرًا" : "Recently launched"}</Link><span>{t.terms} · {t.coming}</span><span>{t.copyright} · {t.coming}</span></div>
      </footer>
    </main>
  );
}
