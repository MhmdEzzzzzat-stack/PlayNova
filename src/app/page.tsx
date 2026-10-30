import type { Metadata } from "next";
import HomeClient from "./home-client";
import { getLocale } from "@/lib/categories";
import { localizedAlternates, localizedUrl } from "@/lib/seo";
import { getPublishedGames, getPublishedCategorySlugs } from "@/lib/games";
import { getCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const title = locale === "ar" ? "PlayNova — العب واكتشف ألعاب المتصفح" : "PlayNova — Discover Browser Games";
  const description = locale === "ar"
    ? "اكتشف ألعاب متصفح متنوعة، وتصفح التصنيفات وطريقة اللعب بالعربية."
    : "Discover browser games, explore genres, and find game instructions in English.";
  return {
    title,
    description,
    alternates: localizedAlternates("/", locale),
    openGraph: { type: "website", title, description, url: localizedUrl("/", locale) },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const [games, availableCategoryIds] = await Promise.all([getPublishedGames(), getPublishedCategorySlugs()]);
  const homeGames = games.map((game) => {
    const category = game.categories[0] || "";
    const categoryInfo = getCategory(category);
    return {
      id: game.slug,
      slug: game.slug,
      title: game.title,
      category,
      categoryName: categoryInfo?.name || { ar: "ألعاب", en: "Games" },
      ...(game.thumbnail ? { thumbnail: game.thumbnail } : {}),
      publishedAt: game.publishedAt || "",
      featured: game.featured,
    };
  });
  return <HomeClient initialLocale={getLocale(params.lang)} games={homeGames} availableCategoryIds={availableCategoryIds} />;
}
