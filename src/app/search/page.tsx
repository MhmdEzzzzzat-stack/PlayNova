import type { Metadata } from "next";
import Link from "next/link";
import { normalizeSearchTerm, getLocale } from "@/lib/categories";
import {SearchEvent} from "@/components/analytics-events";

export const metadata: Metadata = { title: "Search games", description: "Search the PlayNova game catalog.", robots: { index: false, follow: true }, alternates: { canonical: "/search" } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; lang?: string; page?: string }> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  const raw = typeof params.q === "string" ? params.q : "";
  const query = normalizeSearchTerm(raw);
  const invalid = raw.length > 100 || /[<>]/.test(raw);
  const t = ar
    ? { home: "الرئيسية", title: "البحث عن الألعاب", placeholder: "اكتب اسم اللعبة أو كلمة مفتاحية...", submit: "بحث", empty: "اكتب اسم لعبة للبدء في البحث.", noResults: "لا توجد نتائج مطابقة.", waiting: "البحث غير متاح بعد لأن كتالوج الألعاب لم يُربط بقاعدة بيانات.", invalid: "عبارة البحث غير صالحة أو طويلة جدًا.", categories: "تصفّح التصنيفات" }
    : { home: "Home", title: "Search games", placeholder: "Enter a game title or keyword...", submit: "Search", empty: "Enter a game name to start searching.", noResults: "No matching results.", waiting: "Search is not available yet because the game catalog is not connected to a database.", invalid: "The search query is invalid or too long.", categories: "Browse categories" };
  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <SearchEvent term={!invalid?query:""} results={0} />
      <div className="directory-container">
        <nav className="breadcrumbs"><Link href="/">{t.home}</Link><span>/</span><span>{t.title}</span></nav>
        <p className="directory-kicker">PlayNova</p>
        <h1>{t.title}</h1>
        <form action="/search" method="get" className="catalog-search-form">
          <input type="hidden" name="lang" value={locale} />
          <label className="sr-only" htmlFor="game-search">{t.placeholder}</label>
          <input id="game-search" name="q" type="search" maxLength={100} defaultValue={query} placeholder={t.placeholder} />
          <button type="submit">{t.submit}</button>
        </form>
        <div className="directory-empty" aria-live="polite">
          {invalid ? <strong>{t.invalid}</strong> : !query ? <strong>{t.empty}</strong> : <><strong>{t.noResults}</strong><p>{t.waiting}</p></>}
        </div>
        <Link className="directory-back" href={`/categories?lang=${locale}`}>{t.categories} ←</Link>
      </div>
    </main>
  );
}
