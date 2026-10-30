import type { Metadata } from "next";
import Link from "next/link";
import LocaleDocument from "@/components/locale-document";
import { notFound } from "next/navigation";
import { getPublishedGame, getRelatedGames } from "@/lib/games";
import { getLocale } from "@/lib/categories";
import GamePlayer from "./player";
import GameActions from "./actions";
import { GameViewEvent } from "@/components/analytics-events";
import { absoluteUrl, jsonLd, localizedAlternates, localizedUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const game = await getPublishedGame(slug);
  if (!game) return { title: "Game not found", robots: { index: false, follow: false } };
  const locale = getLocale(query.lang);
  const path = `/games/${encodeURIComponent(game.slug)}`;
  const description = game.description[locale].trim().slice(0, 160);
  return {
    title: game.title[locale],
    ...(description ? { description } : {}),
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: "website", title: game.title[locale],
      ...(description ? { description } : {}),
      url: localizedUrl(path, locale),
      ...(game.thumbnail ? { images: [{ url: game.thumbnail, alt: game.title[locale] }] } : {}),
    },
    twitter: {
      card: game.thumbnail ? "summary_large_image" : "summary",
      title: game.title[locale],
      ...(description ? { description } : {}),
      ...(game.thumbnail ? { images: [game.thumbnail] } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

export default async function GamePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const game = await getPublishedGame(slug);
  if (!game) notFound();
  const locale = getLocale(query.lang);
  const ar = locale === "ar";
  const related = await getRelatedGames(game);
  const path = `/games/${encodeURIComponent(game.slug)}`;
  const text = ar
    ? {
        home: "الرئيسية", categories: "التصنيفات", instructions: "طريقة اللعب",
        controls: "التحكم", compatibility: "التوافق", desktop: "الكمبيوتر",
        mobile: game.mobileSupport ? (game.orientation === "portrait" ? "الهاتف واللمس — الوضع الرأسي" : game.orientation === "landscape" ? "الهاتف واللمس — الوضع الأفقي" : "الهاتف واللمس") : "الكمبيوتر فقط حسب بيانات التوافق المسجلة",
        report: "الإبلاغ عن مشكلة", related: "ألعاب قد تعجبك", favorite: "إضافة للمفضلة", share: "مشاركة",
        unavailable: "اللعبة غير متاحة للتشغيل حاليًا",
        noGames: "اللعبة غير متاحة للتشغيل حاليًا.",
        reportNote: "لو واجهت مشكلة في لعبة منشورة، تواصل معنا عبر قناة الدعم عند تفعيلها.",
        ads: "مساحة إعلانية محجوزة — غير مفعّلة",
      }
    : {
        home: "Home", categories: "Categories", instructions: "How to play",
        controls: "Controls", compatibility: "Compatibility", desktop: "Desktop",
        mobile: game.mobileSupport ? (game.orientation === "portrait" ? "Mobile and touch — portrait orientation" : game.orientation === "landscape" ? "Mobile and touch — landscape orientation" : "Mobile and touch") : "Desktop only according to the recorded compatibility data", report: "Report a problem",
        related: "You may also like", favorite: "Add to favorites", share: "Share",
        unavailable: "This game is currently unavailable", noGames: "This game is currently unavailable.",
        reportNote: "For issues with a published game, contact support once the reporting channel is enabled.",
        ads: "Reserved ad placement — disabled",
      };
  const breadcrumbData = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: text.home, item: absoluteUrl(`/?lang=${locale}`) },
      { "@type": "ListItem", position: 2, name: text.categories, item: absoluteUrl(`/categories?lang=${locale}`) },
      { "@type": "ListItem", position: 3, name: game.title[locale], item: localizedUrl(path, locale) },
    ],
  };
  const gameData = {
    "@context": "https://schema.org", "@type": "VideoGame",
    name: game.title[locale], description: game.description[locale],
    url: localizedUrl(path, locale), inLanguage: locale,
    genre: game.categories,
    ...(game.thumbnail ? { image: absoluteUrl(game.thumbnail) } : {}),
  };

  return (
    <main className="game-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <LocaleDocument locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(gameData) }} />
      <GameViewEvent slug={game.slug} />
      <div className="game-page-container">
        <nav className="game-breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}>
          <Link href={`/?lang=${locale}`}>{text.home}</Link><span>/</span>
          <Link href={`/categories?lang=${locale}`}>{text.categories}</Link><span>/</span>
          <span aria-current="page">{game.title[locale]}</span>
        </nav>
        <div className="game-page-heading">
          <div><p className="directory-kicker">PlayNova</p><h1>{game.title[locale]}</h1><p>{game.description[locale]}</p></div>
          <GameActions slug={game.slug} title={game.title[locale]} favoriteLabel={text.favorite} shareLabel={text.share} locale={locale} />
        </div>
        <GamePlayer slug={game.slug} locale={locale} launch={game.launch} title={game.title[locale]} unavailableText={text.unavailable} emptyText={text.noGames} />
        <div className="game-info-grid">
          <section className="game-info-panel"><h2>{text.instructions}</h2><p>{game.instructions[locale]}</p></section>
          <section className="game-info-panel"><h2>{text.controls}</h2><p>{game.controls[locale]}</p></section>
          <section className="game-info-panel"><h2>{text.compatibility}</h2><p>{text.desktop}</p><p>{text.mobile}</p></section>
          <section className="game-info-panel"><h2>{text.report}</h2><p>{text.reportNote}</p></section>
        </div>
        <aside className="game-ad-slot" aria-label={text.ads}>{text.ads}</aside>
        {related.length > 0 && <section className="related-games"><h2>{text.related}</h2><div>{related.map((item) => <Link key={item.slug} href={`/games/${item.slug}?lang=${locale}`}>{item.title[locale]}</Link>)}</div></section>}
      </div>
    </main>
  );
}
