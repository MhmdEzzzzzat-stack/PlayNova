import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedGame, getRelatedGames } from "@/lib/games";
import { getLocale } from "@/lib/categories";
import GamePlayer from "./player";
import GameActions from "./actions";
import {GameViewEvent} from "@/components/analytics-events";
import { absoluteUrl, jsonLd, localizedAlternates, localizedUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getPublishedGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: game.title.en,
    description: game.description.en,
    robots: { index: false, follow: false },
  };
}

export default async function GamePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const game = await getPublishedGame(slug);
  if (!game) notFound();

  const locale = getLocale(query.lang);
  const ar = locale === "ar";
  const related = await getRelatedGames(game);\n  const pagePath = `/games/${encodeURIComponent(game.slug)}`;\n  const breadcrumbData = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [\n    { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: absoluteUrl(`/?lang=${locale}`) },\n    { "@type": "ListItem", position: 2, name: ar ? "التصنيفات" : "Categories", item: absoluteUrl(`/categories?lang=${locale}`) },\n    { "@type": "ListItem", position: 3, name: game.title[locale], item: localizedUrl(pagePath, locale) },\n  ] };\n  const gameData = { "@context": "https://schema.org", "@type": "VideoGame", name: game.title[locale], description: game.description[locale], url: localizedUrl(pagePath, locale), inLanguage: locale, genre: game.categories, ...(game.thumbnail ? { image: absoluteUrl(game.thumbnail) } : {}) };
  const text = ar
    ? {
        home: "الرئيسية", categories: "التصنيفات", instructions: "طريقة اللعب",
        controls: "التحكم", compatibility: "التوافق", desktop: "الكمبيوتر",
        mobile: "الهاتف واللمس حسب دعم اللعبة", report: "الإبلاغ عن مشكلة",
        related: "ألعاب قد تعجبك", favorite: "إضافة للمفضلة", share: "مشاركة",
        unavailable: "اللعبة غير متاحة للتشغيل حاليًا",
        noGames: "لم يتم نشر ألعاب فعلية بعد. ستظهر اللعبة هنا بعد مراجعة ترخيصها وإعداد مصدر التشغيل الآمن.",
        reportNote: "لو واجهت مشكلة في لعبة منشورة، تواصل معنا عبر قناة الدعم عند تفعيلها.",
        ads: "مساحة إعلانية محجوزة — غير مفعّلة",
      }
    : {
        home: "Home", categories: "Categories", instructions: "How to play",
        controls: "Controls", compatibility: "Compatibility", desktop: "Desktop",
        mobile: "Mobile and touch where supported", report: "Report a problem",
        related: "You may also like", favorite: "Add to favorites", share: "Share",
        unavailable: "This game is currently unavailable",
        noGames: "No playable games have been published yet. This page will become available after its license and secure launch configuration are reviewed.",
        reportNote: "For issues with a published game, contact support once the reporting channel is enabled.",
        ads: "Reserved ad placement — disabled",
      };

  return (
    <main className="game-page" dir={ar ? "rtl" : "ltr"} lang={locale}>
      <GameViewEvent slug={game.slug} />
      <div className="game-page-container">
        <nav className="game-breadcrumbs" aria-label={ar ? "مسار التنقل" : "Breadcrumb"}>
          <Link href="/">{text.home}</Link><span>/</span>
          <Link href={`/categories?lang=${locale}`}>{text.categories}</Link><span>/</span>
          <span>{game.title[locale]}</span>
        </nav>
        <div className="game-page-heading">
          <div><p className="directory-kicker">PlayNova</p><h1>{game.title[locale]}</h1><p>{game.description[locale]}</p></div>
          <GameActions slug={game.slug} title={game.title[locale]} favoriteLabel={text.favorite} shareLabel={text.share} locale={locale} />
        </div>

        <GamePlayer
          slug={game.slug}
          locale={locale}
          launch={game.launch}
          title={game.title[locale]}
          unavailableText={text.unavailable}
          emptyText={text.noGames}
        />

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
