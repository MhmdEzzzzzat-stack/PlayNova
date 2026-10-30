import type { Metadata } from "next";
import Link from "next/link";
import LocaleDocument from "@/components/locale-document";
import { categories, getLocale } from "@/lib/categories";
import { getPublishedCategorySlugs } from "@/lib/games";
import { localizedAlternates } from "@/lib/seo";

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const populated = await getPublishedCategorySlugs();
  const title = locale === "ar" ? "تصنيفات ألعاب المتصفح" : "Browser Game Categories";
  const description = locale === "ar" ? "تصفح ألعاب المتصفح حسب النوع والتصنيف." : "Browse browser games by genre and category.";
  return {
    title, description,
    alternates: localizedAlternates("/categories", locale),
    openGraph: { type: "website", title, description, url: new URL(`/categories?lang=${locale}`, process.env.NEXT_PUBLIC_SITE_URL || "https://playnova.mzt112006mzt.workers.dev").toString() },
    twitter: { card: "summary", title, description },
    robots: { index: populated.length > 0, follow: true },
  };
}

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  const populated = new Set(await getPublishedCategorySlugs());
  const visibleCategories = categories.filter((category) => populated.has(category.slug));

  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <LocaleDocument locale={locale} />
      <div className="directory-container">
        <Link href={`/?lang=${locale}`} className="directory-back">{ar ? "← العودة للرئيسية" : "← Back to home"}</Link>
        <p className="directory-kicker">PlayNova</p>
        <h1>{ar ? "تصفّح التصنيفات" : "Browse categories"}</h1>
        <p className="directory-intro">{ar ? "اختر نوع اللعبة التي تريد استكشافها." : "Choose a genre to explore published browser games."}</p>
        {visibleCategories.length === 0
          ? <p className="directory-empty">{ar ? "لا توجد تصنيفات بها ألعاب منشورة حاليًا." : "There are no categories with published games yet."}</p>
          : <div className="directory-grid">{visibleCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}?lang=${locale}`} className="directory-card">
                <span>{category.name[locale]}</span>
                <p>{category.description[locale]}</p>
                <small>{ar ? "استكشف التصنيف ←" : "Explore category →"}</small>
              </Link>
            ))}</div>}
      </div>
    </main>
  );
}
