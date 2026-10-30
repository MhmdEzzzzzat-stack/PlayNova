import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/categories";
import { getPublishedCategories } from "@/lib/games";
import { absoluteUrl, jsonLd, localizedAlternates } from "@/lib/seo";
import LocaleDocument from "@/components/locale-document";

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const categories = await getPublishedCategories();
  const title = locale === "ar" ? "تصنيفات ألعاب المتصفح" : "Browser Game Categories";
  const description = locale === "ar" ? "تصفح ألعاب المتصفح حسب النوع والتصنيف." : "Browse browser games by genre and category.";
  const url = new URL(`/categories?lang=${locale}`, process.env.NEXT_PUBLIC_SITE_URL || "https://playnova.mzt112006mzt.workers.dev").toString();
  return {
    title, description,
    alternates: localizedAlternates("/categories", locale),
    openGraph: { type: "website", title, description, url },
    twitter: { card: "summary", title, description },
    robots: { index: categories.length > 0, follow: true },
  };
}

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  const categories = await getPublishedCategories();
  const breadcrumbData = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: absoluteUrl(`/?lang=${locale}`) },
      { "@type": "ListItem", position: 2, name: ar ? "التصنيفات" : "Categories", item: absoluteUrl(`/categories?lang=${locale}`) },
    ],
  };

  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <LocaleDocument locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }} />
      <div className="directory-container">
        <nav className="breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}><Link href={`/?lang=${locale}`}>{ar ? "الرئيسية" : "Home"}</Link><span>/</span><span aria-current="page">{ar ? "التصنيفات" : "Categories"}</span></nav>
        <p className="directory-kicker">PlayNova</p>
        <h1>{ar ? "تصفّح التصنيفات" : "Browse categories"}</h1>
        <p className="directory-intro">{ar ? "اختر نوع اللعبة التي تريد استكشافها." : "Choose a genre to explore published browser games."}</p>
        {categories.length === 0
          ? <p className="directory-empty">{ar ? "لا توجد تصنيفات بها ألعاب منشورة حاليًا." : "There are no categories with published games yet."}</p>
          : <div className="directory-grid">{categories.map((category) => (
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
