import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory, getLocale, parsePage } from "@/lib/categories";
import { getPublishedGamesForCategory } from "@/lib/games";
import { CategoryViewEvent } from "@/components/analytics-events";
import { absoluteUrl, jsonLd, localizedAlternates, localizedUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string; page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };
  const locale = getLocale(query.lang);
  const games = await getPublishedGamesForCategory(slug);
  const path = `/categories/${encodeURIComponent(slug)}`;
  const description = category.description[locale];
  return {
    title: category.name[locale], description,
    alternates: localizedAlternates(path, locale),
    openGraph: { type: "website", title: category.name[locale], description, url: localizedUrl(path, locale) },
    robots: { index: games.length > 0, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();
  const locale = getLocale(query.lang);
  const ar = locale === "ar";
  const page = parsePage(query.page);
  const games = await getPublishedGamesForCategory(slug);
  const related = categories.filter((item) => item.slug !== slug).slice(0, 5);
  const t = ar
    ? { home: "الرئيسية", cats: "التصنيفات", games: "الألعاب في هذا التصنيف", empty: "لا توجد ألعاب منشورة في هذا التصنيف حتى الآن.", search: "ابحث عن لعبة", page: "الصفحة", related: "تصنيفات أخرى", back: "كل التصنيفات" }
    : { home: "Home", cats: "Categories", games: "Games in this category", empty: "There are no published games in this category yet.", search: "Search games", page: "Page", related: "Related categories", back: "All categories" };
  const path = `/categories/${encodeURIComponent(slug)}`;
  const breadcrumbData = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: absoluteUrl(`/?lang=${locale}`) },
      { "@type": "ListItem", position: 2, name: t.cats, item: absoluteUrl(`/categories?lang=${locale}`) },
      { "@type": "ListItem", position: 3, name: category.name[locale], item: localizedUrl(path, locale) },
    ],
  };

  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }} />
      <CategoryViewEvent categoryId={category.slug} />
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}>
          <Link href={`/?lang=${locale}`}>{t.home}</Link><span>/</span>
          <Link href={`/categories?lang=${locale}`}>{t.cats}</Link><span>/</span>
          <span aria-current="page">{category.name[locale]}</span>
        </nav>
        <p className="directory-kicker">PlayNova / {category.slug}</p>
        <h1>{category.name[locale]}</h1>
        <p className="directory-intro">{category.description[locale]}</p>
        <section className="category-results">
          <h2>{t.games}</h2>
          {games.length === 0
            ? <div className="directory-empty"><strong>{t.empty}</strong><Link href={`/search?lang=${locale}`}>{t.search}</Link></div>
            : <div className="game-grid">{games.map((game) => (
                <article key={game.slug} className="game-card">
                  <Link href={`/games/${game.slug}?lang=${locale}`} className="game-card-link">
                    <div className="game-thumb">
                      {game.thumbnail
                        ? <Image src={game.thumbnail} alt={game.title[locale]} fill sizes="(max-width: 640px) 50vw, 25vw" loading="lazy" unoptimized />
                        : <span aria-hidden="true">🎮</span>}
                    </div>
                    <div className="game-card-copy"><h3>{game.title[locale]}</h3><p>{game.description[locale]}</p></div>
                  </Link>
                </article>
              ))}</div>}
          <div className="pagination" aria-label="Pagination"><span>{t.page} {page}</span></div>
        </section>
        {related.length > 0 && <section className="related-categories"><h2>{t.related}</h2><div>{related.map((item) => <Link key={item.slug} href={`/categories/${item.slug}?lang=${locale}`}>{item.name[locale]}</Link>)}</div></section>}
        <Link className="directory-back" href={`/categories?lang=${locale}`}>← {t.back}</Link>
      </div>
    </main>
  );
}
