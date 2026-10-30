import type { MetadataRoute } from "next";
import { getPublishedGames, getPublishedCategorySlugs } from "@/lib/games";
import { localizedUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, categorySlugs] = await Promise.all([
    getPublishedGames(),
    getPublishedCategorySlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: localizedUrl("/", "ar"), changeFrequency: "daily", priority: 1 },
    { url: localizedUrl("/", "en"), changeFrequency: "daily", priority: 0.9 },
    { url: localizedUrl("/privacy", "ar"), changeFrequency: "yearly", priority: 0.2 },
    { url: localizedUrl("/privacy", "en"), changeFrequency: "yearly", priority: 0.2 },
  ];

  if (categorySlugs.length > 0) {
    entries.push(
      { url: localizedUrl("/categories", "ar"), changeFrequency: "weekly", priority: 0.8 },
      { url: localizedUrl("/categories", "en"), changeFrequency: "weekly", priority: 0.7 },
    );
  }

  for (const slug of categorySlugs) {
    const path = `/categories/${encodeURIComponent(slug)}`;
    entries.push(
      { url: localizedUrl(path, "ar"), changeFrequency: "weekly", priority: 0.7 },
      { url: localizedUrl(path, "en"), changeFrequency: "weekly", priority: 0.6 },
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
