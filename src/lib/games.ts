import "server-only";
import { getPlayNovaDb } from "@/lib/db";

export type GameLocale = "ar" | "en";
export type LaunchMode = "hosted-html5" | "authorized-embed" | "publisher-sdk";
export type GamePermissions = { fullscreen: boolean; pointerLock: boolean; orientationLock: boolean };
export type PublishedGame = {
  slug: string;
  title: Record<GameLocale, string>;
  description: Record<GameLocale, string>;
  instructions: Record<GameLocale, string>;
  controls: Record<GameLocale, string>;
  categories: string[];
  tags: string[];
  thumbnail?: string;
  publishedAt?: string;
  featured: boolean;
  mobileSupport: boolean;
  orientation: "any" | "portrait" | "landscape";
  launch: {
    mode: LaunchMode; url: string; allowedOrigin: string;
    permissions: GamePermissions; authorizationReference: string;
  };
};

type GameRow = {
  slug: string; title_ar: string; title_en: string; description_ar: string; description_en: string;
  instructions_ar: string; instructions_en: string; controls_ar: string; controls_en: string;
  thumbnail_url: string | null; launch_mode: LaunchMode; launch_url: string; allowed_origin: string;
  authorization_reference: string; permissions_fullscreen: number; permissions_pointer_lock: number;
  permissions_orientation_lock: number; categories: string | null; tags: string | null;
  featured: number; published_at: string | null; mobile_support: number; orientation: "any" | "portrait" | "landscape";
};

const mapGame = (row: GameRow): PublishedGame => ({
  slug: row.slug,
  title: { ar: row.title_ar, en: row.title_en },
  description: { ar: row.description_ar, en: row.description_en },
  instructions: { ar: row.instructions_ar, en: row.instructions_en },
  controls: { ar: row.controls_ar, en: row.controls_en },
  categories: row.categories ? row.categories.split(",") : [],
  tags: row.tags ? row.tags.split(",") : [],
  featured: Boolean(row.featured),\n  mobileSupport: Boolean(row.mobile_support),\n  orientation: row.orientation,
  ...(row.published_at ? { publishedAt: row.published_at } : {}),
  ...(row.thumbnail_url ? { thumbnail: row.thumbnail_url } : {}),
  launch: {
    mode: row.launch_mode, url: row.launch_url, allowedOrigin: row.allowed_origin,
    authorizationReference: row.authorization_reference,
    permissions: {
      fullscreen: Boolean(row.permissions_fullscreen),
      pointerLock: Boolean(row.permissions_pointer_lock),
      orientationLock: Boolean(row.permissions_orientation_lock),
    },
  },
});

const SELECT_PUBLISHED = `
SELECT g.*,
  (SELECT group_concat(gc.category_id) FROM game_categories gc WHERE gc.game_id = g.id) AS categories,
  (SELECT group_concat(gt.tag) FROM game_tags gt WHERE gt.game_id = g.id) AS tags
FROM games g
WHERE g.status = 'published' AND g.license_status = 'approved' AND g.moderation_status = 'active'
  AND length(trim(g.authorization_reference)) > 0
`;

export async function getPublishedGame(slug: string): Promise<PublishedGame | undefined> {
  const db = await getPlayNovaDb();
  const row = await db.prepare(`${SELECT_PUBLISHED} AND g.slug = ? LIMIT 1`).bind(slug).first<GameRow>();
  return row ? mapGame(row) : undefined;
}

export async function getPublishedGames(): Promise<PublishedGame[]> {
  const db = await getPlayNovaDb();
  const result = await db.prepare(`${SELECT_PUBLISHED} ORDER BY g.featured DESC, g.published_at DESC`).all<GameRow>();
  return result.results.map(mapGame);
}

export async function getRelatedGames(game: PublishedGame, limit = 4): Promise<PublishedGame[]> {
  const all = await getPublishedGames();
  return all.filter((candidate) => candidate.slug !== game.slug)
    .map((candidate) => ({ game: candidate, score:
      candidate.categories.filter((item) => game.categories.includes(item)).length * 3 +
      candidate.tags.filter((item) => game.tags.includes(item)).length }))
    .filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
    .slice(0, limit).map((item) => item.game);
}

export function validateGameLaunch(game: PublishedGame) {
  try {
    const url = new URL(game.launch.url);
    const allowedOrigin = new URL(game.launch.allowedOrigin);
    return url.protocol === "https:" && allowedOrigin.protocol === "https:" &&
      url.origin === allowedOrigin.origin && Boolean(game.launch.authorizationReference.trim()) &&
      ["hosted-html5", "authorized-embed", "publisher-sdk"].includes(game.launch.mode);
  } catch { return false; }
}

export async function getPublishedCategorySlugs(): Promise<string[]> {
  const db = await getPlayNovaDb();
  const result = await db.prepare(`
    SELECT DISTINCT c.slug
    FROM categories c
    JOIN game_categories gc ON gc.category_id = c.id
    JOIN games g ON g.id = gc.game_id
    WHERE c.visible = 1 AND g.status = 'published'
      AND g.license_status = 'approved' AND g.moderation_status = 'active'
      AND length(trim(g.authorization_reference)) > 0
    ORDER BY c.slug
  `).all<{ slug: string }>();
  return result.results.map((row) => row.slug);
}

export async function getPublishedGamesForCategory(slug: string): Promise<PublishedGame[]> {
  const db = await getPlayNovaDb();
  const result = await db.prepare(`
    ${SELECT_PUBLISHED}
    AND EXISTS (
      SELECT 1 FROM game_categories gc
      JOIN categories c ON c.id = gc.category_id
      WHERE gc.game_id = g.id AND c.slug = ? AND c.visible = 1
    )
    ORDER BY g.featured DESC, g.published_at DESC
  `).bind(slug).all<GameRow>();
  return result.results.map(mapGame);
}
