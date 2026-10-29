import type { MetadataRoute } from "next";
import { getPublishedGames, getPublishedCategorySlugs } from "@/lib/games";
import { SITE_URL, localizedUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, categorySlugs] = await Promise.all([
    getPublishedGames(),
    getPublishedCategorySlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: localizedUrl("/", "en"), changeFrequency: "daily", priority: 0.9 },
    { url: localizedUrl("/categories", "ar"), changeFrequency: "weekly", priority: 0.8 },
    { url: localizedUrl("/categories", "en"), changeFrequency: "weekly", priority: 0.7 },
    { url: localizedUrl("/privacy", "ar"), changeFrequency: "yearly", priority: 0.2 },
    { url: localizedUrl("/privacy", "en"), changeFrequency: "yearly", priority: 0.2 },
  ];

  for (const slug of categorySlugs) {
    entries.push(
      { url: localizedUrl(`/categories/${encodeURIComponent(slug)}`, "ar"), changeFrequency: "weekly", priority: 0.7 },
      { url: localizedUrl(`/categories/${encodeURIComponent(slug)}`, "en"), changeFrequency: "weekly", priority: 0.6 },
    );
  }

  for (const game of games) {
    const path = `/games/${encodeURIComponent(game.slug)}`;
    entries.push(
      { url: localizedUrl(path, "ar"), changeFrequency: "weekly", priority: 0.8 },
      { url: localizedUrl(path, "en"), changeFrequency: "weekly", priority: 0.8 },
    );
  }

  return entries;
}
