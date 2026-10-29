import type { Metadata } from "next";
import Link from "next/link";
import { categories, getLocale } from "@/lib/categories";

export const metadata: Metadata = { title: "Categories", description: "Browse PlayNova game categories." };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const ar = locale === "ar";
  return (
    <main className="directory-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <div className="directory-container">
        <Link href="/" className="directory-back">{ar ? "← العودة للرئيسية" : "← Back to home"}</Link>
        <p className="directory-kicker">PlayNova</p>
        <h1>{ar ? "تصفّح التصنيفات" : "Browse categories"}</h1>
        <p className="directory-intro">{ar ? "اختر النوع الذي يناسبك. ستظهر الألعاب المنشورة هنا عند ربط كتالوج الألعاب." : "Choose a genre. Published games will appear here once the game catalog is connected."}</p>
        <div className="directory-grid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}?lang=${locale}`} className="directory-card">
              <span>{category.name[locale]}</span>
              <p>{category.description[locale]}</p>
              <small>{ar ? "استكشف التصنيف ←" : "Explore category →"}</small>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
