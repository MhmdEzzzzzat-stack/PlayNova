import { getPublishedGames } from "@/lib/games";
import { getLocale } from "@/lib/categories";
import FavoritesClient from "./FavoritesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Favorites | PlayNova", robots: { index: false, follow: false } };

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const games = await getPublishedGames();
  return <FavoritesClient locale={locale} games={games.map(({ slug, title, description, thumbnail }) => ({ slug, title, description, ...(thumbnail ? { thumbnail } : {}) }))} />;
}
