import { getPublishedGames } from "@/lib/games";
import { getLocale } from "@/lib/categories";
import RecentClient from "./RecentClient";

export const metadata = { title: "Recently launched | PlayNova", robots: { index: false, follow: false } };

export default async function RecentPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const games = await getPublishedGames();
  return <RecentClient locale={locale} games={games.map(({ slug, title, description }) => ({ slug, title, description }))} />;
}
