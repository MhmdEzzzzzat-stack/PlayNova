"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "ar" | "en";
type GameCard = { slug: string; title: Record<Locale, string>; description: Record<Locale, string> };
type RecentEntry = { slug: string; launchedAt: string };
const KEY = "playnova-recent";

export default function RecentClient({ locale, games }: { locale: Locale; games: GameCard[] }) {
  const [entries, setEntries] = useState<RecentEntry[]>([]);
  const [ready, setReady] = useState(false);
  const ar = locale === "ar";
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      const available = new Set(games.map((game) => game.slug));
      const valid = (Array.isArray(raw) ? raw : []).filter((item): item is RecentEntry =>
        typeof item === "object" && item !== null && typeof item.slug === "string" &&
        typeof item.launchedAt === "string" && available.has(item.slug) && !Number.isNaN(Date.parse(item.launchedAt))
      ).slice(0, 20);
      setEntries(valid);
      localStorage.setItem(KEY, JSON.stringify(valid));
    } catch { setEntries([]); }
    setReady(true);
  }, [games]);

  const clear = () => {
    setEntries([]);
    try { localStorage.removeItem(KEY); } catch {}
  };
  const selected = entries.map((entry) => ({ entry, game: games.find((game) => game.slug === entry.slug) })).filter((item) => item.game);
  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}><Link href={`/?lang=${locale}`}>{ar ? "الرئيسية" : "Home"}</Link><span>/</span><span>{ar ? "تم تشغيلها مؤخرًا" : "Recently launched"}</span></nav>
        <p className="directory-kicker">PlayNova</p><h1>{ar ? "تم تشغيلها مؤخرًا" : "Recently launched"}</h1>
        {!ready ? <p role="status">{ar ? "جارٍ تحميل السجل…" : "Loading history…"}</p> : selected.length === 0 ? <div className="directory-empty"><strong>{ar ? "لا يوجد سجل تشغيل بعد." : "No recent launches yet."}</strong><p>{ar ? "يُسجل هنا عند تحميل إطار اللعبة، وليس عند مجرد فتح صفحة اللعبة." : "A game is listed here when its game frame loads, not from a page view alone."}</p></div> :
          <><button type="button" onClick={clear}>{ar ? "مسح السجل" : "Clear history"}</button><div className="directory-grid">{selected.map(({ entry, game }) => game && <article key={entry.slug} className="directory-card"><Link href={`/games/${entry.slug}?lang=${locale}`}><strong>{game.title[locale]}</strong><p>{game.description[locale]}</p></Link><small>{new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.launchedAt))}</small></article>)}</div></>}
        <p className="directory-intro">{ar ? "السجل محفوظ على هذا الجهاز فقط، ويحتوي على معرّف اللعبة ووقت تحميلها دون حساب أو تتبع خارجي." : "History stays on this device and stores only a game slug and launch time; no account or external tracking is used."}</p>
      </div>
    </main>
  );
}
