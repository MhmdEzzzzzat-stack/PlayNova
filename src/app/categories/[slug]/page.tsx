import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory, getLocale, parsePage } from "@/lib/categories";
import {CategoryViewEvent} from "@/components/analytics-events";
import Image from "next/image";
import { getPublishedGamesForCategory } from "@/lib/games";
import { absoluteUrl, jsonLd, localizedAlternates, localizedUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string; page?: string }> };

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name.en, description: category.description.en };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();
  const locale = getLocale(query.lang);
  const ar = locale === "ar";
  const page = parsePage(query.page);
  const t = ar
    ? { home: "الرئيسية", cats: "التصنيفات", games: "الألعاب في هذا التصنيف", empty: "لا توجد ألعاب منشورة في هذا التصنيف حتى الآن.", note: "سيظهر المحتوى هنا بعد ربط كتالوج الألعاب المنشورة.", page: "الصفحة", previous: "السابق", next: "التالي", related: "تصنيفات أخرى", search: "ابحث عن لعبة", back: "كل التصنيفات" }
    : { home: "Home", cats: "Categories", games: "Games in this category", empty: "There are no published games in this category yet.", note: "Catalog content will appear here once the published games database is connected.", page: "Page", previous: "Previous", next: "Next", related: "Related categories", search: "Search games", back: "All categories" };
  const related = categories.filter((item) => item.slug !== slug).slice(0, 5);\n  const games = await getPublishedGamesForCategory(slug);\n  const pagePath = `/categories/${encodeURIComponent(slug)}`;\n  const breadcrumbData = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [\n    { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: absoluteUrl(`/?lang=${locale}`) },\n    { "@type": "ListItem", position: 2, name: t.cats, item: absoluteUrl(`/categories?lang=${locale}`) },\n    { "@type": "ListItem", position: 3, name: category.name[locale], item: localizedUrl(pagePath, locale) },\n  ] };
  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <CategoryViewEvent categoryId={category.slug} />
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}>
          <Link href="/">{t.home}</Link><span>/</span><Link href={`/categories?lang=${locale}`}>{t.cats}</Link><span>/</span><span aria-current="page">{category.name[locale]}</span>
        </nav>
        <p className="directory-kicker">PlayNova / {category.slug}</p>
        <h1>{category.name[locale]}</h1>
        <p className="directory-intro">{category.description[locale]}</p>
        <section className="category-results">
          <h2>{t.games}</h2>
          {games.length === 0 ? <div className="directory-empty"><strong>{t.empty}</strong><p>{t.note}</p><Link href={`/search?lang=${locale}`}>{t.search}</Link></div> : <div className="game-grid">{games.map((game) => <article key={game.slug} className="game-card"><Link href={`/games/${game.slug}?lang=${locale}`} className="game-card-link"><div className="game-thumb">{game.thumbnail ? <Image src={game.thumbnail} alt={game.title[locale]} fill sizes="(max-width: 640px) 50vw, 25vw" loading="lazy" unoptimized /> : <span aria-hidden="true">🎮</span>}</div><div className="game-card-copy"><h3>{game.title[locale]}</h3><p>{game.description[locale]}</p></div></Link></article>)}</div>}
          <div className="pagination" aria-label="Pagination">
            <span>{t.page} {page}</span>
            <button disabled>{t.previous}</button><button disabled>{t.next}</button>
          </div>
        </section>
        <section className="related-categories"><h2>{t.related}</h2><div>{related.map((item) => <Link key={item.slug} href={`/categories/${item.slug}?lang=${locale}`}>{item.name[locale]}</Link>)}</div></section>
        <Link className="directory-back" href={`/categories?lang=${locale}`}>← {t.back}</Link>
      </div>
    </main>
  );
}
