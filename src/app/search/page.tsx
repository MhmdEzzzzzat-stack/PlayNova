import type { Metadata } from "next";
import Link from "next/link";
import LocaleDocument from "@/components/locale-document";
import { normalizeSearchTerm, getLocale } from "@/lib/categories";
import { getPublishedGames } from "@/lib/games";
import { SearchEvent } from "@/components/analytics-events";

export const metadata: Metadata = {
  title: "Search games",
  description: "Search the PlayNova game catalog.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string; page?: string }>;
}) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  const raw = typeof params.q === "string" ? params.q : "";
  const query = normalizeSearchTerm(raw);
  const invalid = raw.length > 100 || /[<>]/.test(raw);

  const t = ar
    ? {
        home: "الرئيسية",
        title: "البحث عن الألعاب",
        placeholder: "اكتب اسم اللعبة أو كلمة مفتاحية...",
        submit: "بحث",
        empty: "اكتب اسم لعبة للبدء في البحث.",
        noResults: "لا توجد نتائج مطابقة.",
        invalid: "عبارة البحث غير صالحة أو طويلة جدًا.",
        categories: "تصفّح التصنيفات",
        resultCount: "نتائج البحث",
        description: "افتح صفحة اللعبة لمعرفة التفاصيل وبدء اللعب.",
      }
    : {
        home: "Home",
        title: "Search games",
        placeholder: "Enter a game title or keyword...",
        submit: "Search",
        empty: "Enter a game name to start searching.",
        noResults: "No matching results.",
        invalid: "The search query is invalid or too long.",
        categories: "Browse categories",
        resultCount: "Search results",
        description: "Open a game page to see details and start playing.",
      };

  const games = query && !invalid ? await getPublishedGames() : [];
  const normalizedQuery = normalizeSearchTerm(query).toLocaleLowerCase(locale);
  const normalizeField = (value: string) =>
    normalizeSearchTerm(value).toLocaleLowerCase(locale);

  const results = games.filter((game) => {
    const searchableFields = [
      game.title.ar,
      game.title.en,
      game.description.ar,
      game.description.en,
      game.instructions.ar,
      game.instructions.en,
      game.controls.ar,
      game.controls.en,
      ...game.categories,
      ...game.tags,
    ];

    return searchableFields.some((field) =>
      normalizeField(field).includes(normalizedQuery),
    );
  });

  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <LocaleDocument locale={locale} />
      <SearchEvent term={!invalid ? query : ""} results={results.length} />
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}>
          <Link href={`/?lang=${locale}`}>{t.home}</Link>
          <span>/</span>
          <span>{t.title}</span>
        </nav>
        <p className="directory-kicker">PlayNova</p>
        <h1>{t.title}</h1>
        <form action="/search" method="get" className="catalog-search-form">
          <input type="hidden" name="lang" value={locale} />
          <label className="sr-only" htmlFor="game-search">
            {t.placeholder}
          </label>
          <input
            id="game-search"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={query}
            placeholder={t.placeholder}
          />
          <button type="submit">{t.submit}</button>
        </form>

        <section aria-live="polite" aria-label={t.resultCount}>
          {invalid ? (
            <div className="directory-empty">
              <strong>{t.invalid}</strong>
            </div>
          ) : !query ? (
            <div className="directory-empty">
              <strong>{t.empty}</strong>
            </div>
          ) : results.length === 0 ? (
            <div className="directory-empty">
              <strong>{t.noResults}</strong>
            </div>
          ) : (
            <>
              <p className="directory-intro">
                {t.resultCount}: {results.length}
              </p>
              <div className="directory-grid">
                {results.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/games/${encodeURIComponent(game.slug)}?lang=${locale}`}
                    className="directory-card"
                  >
                    <strong>{game.title[locale]}</strong>
                    <p>{game.description[locale]}</p>
                    <small>{t.description}</small>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <Link className="directory-back" href={`/categories?lang=${locale}`}>
          {t.categories} ←
        </Link>
      </div>
    </main>
  );
}
