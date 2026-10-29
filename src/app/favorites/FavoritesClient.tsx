"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "ar" | "en";
type GameCard = { slug: string; title: Record<Locale, string>; description: Record<Locale, string>; thumbnail?: string };
const KEY = "playnova-favorites";

function readKeys(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? [...new Set(raw.filter((v): v is string => typeof v === "string"))] : [];
  } catch { return []; }
}

export default function FavoritesClient({ locale, games }: { locale: Locale; games: GameCard[] }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const ar = locale === "ar";
  useEffect(() => {
    const saved = readKeys();
    const available = new Set(games.map((game) => game.slug));
    const valid = saved.filter((slug) => available.has(slug));
    setKeys(valid);
    try { localStorage.setItem(KEY, JSON.stringify(valid)); } catch {}
    setReady(true);
  }, [games]);

  const remove = (slug: string) => {
    const next = keys.filter((item) => item !== slug);
    setKeys(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  const selected = keys.map((slug) => games.find((game) => game.slug === slug)).filter((game): game is GameCard => Boolean(game));
  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}><Link href={`/?lang=${locale}`}>{ar ? "الرئيسية" : "Home"}</Link><span>/</span><span>{ar ? "المفضلة" : "Favorites"}</span></nav>
        <p className="directory-kicker">PlayNova</p><h1>{ar ? "ألعابك المفضلة" : "Your favorites"}</h1>
        {!ready ? <p role="status">{ar ? "جارٍ تحميل المفضلة…" : "Loading favorites…"}</p> : selected.length === 0 ? (
          <div className="directory-empty"><strong>{ar ? "لا توجد ألعاب محفوظة حتى الآن." : "No saved games yet."}</strong><p>{ar ? "أضف لعبة للمفضلة من صفحة اللعبة، وسيتم حفظها على هذا الجهاز." : "Add a game from its page. Favorites are saved on this device."}</p><Link href={`/categories?lang=${locale}`}>{ar ? "تصفّح التصنيفات" : "Browse categories"}</Link></div>
        ) : <div className="directory-grid">{selected.map((game) => <article key={game.slug} className="directory-card"><Link href={`/games/${game.slug}?lang=${locale}`}><strong>{game.title[locale]}</strong><p>{game.description[locale]}</p></Link><button type="button" onClick={() => remove(game.slug)}>{ar ? "إزالة من المفضلة" : "Remove favorite"}</button></article>)}</div>}
        <p className="directory-intro">{ar ? "المفضلة محفوظة محليًا في هذا المتصفح فقط؛ لا يوجد حساب أو مزامنة سحابية مفعّلة." : "Favorites are stored locally in this browser only; accounts and cloud sync are not enabled."}</p>
      </div>
    </main>
  );
}
