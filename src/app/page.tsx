import type { Metadata } from "next";
import HomeClient from "./home-client";
import { getLocale } from "@/lib/categories";
import { localizedAlternates, localizedUrl } from "@/lib/seo";

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
  return <HomeClient initialLocale={getLocale(params.lang)} />;
}
