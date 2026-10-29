import "server-only";

export type GameLocale = "ar" | "en";
export type LaunchMode = "hosted-html5" | "authorized-embed" | "publisher-sdk";
export type GamePermissions = {
  fullscreen: boolean;
  pointerLock: boolean;
  orientationLock: boolean;
};

export type PublishedGame = {
  slug: string;
  title: Record<GameLocale, string>;
  description: Record<GameLocale, string>;
  instructions: Record<GameLocale, string>;
  controls: Record<GameLocale, string>;
  categories: string[];
  tags: string[];
  thumbnail?: string;
  launch: {
    mode: LaunchMode;
    url: string;
    allowedOrigin: string;
    permissions: GamePermissions;
    authorizationReference: string;
  };
};

// Empty by design: add only reviewed, published and properly licensed game records.
// Never populate this registry from user-submitted URLs.
const publishedGames: PublishedGame[] = [];

export function getPublishedGame(slug: string) {
  return publishedGames.find((game) => game.slug === slug);
}

export function getRelatedGames(game: PublishedGame, limit = 4) {
  return publishedGames
    .filter((candidate) => candidate.slug !== game.slug)
    .map((candidate) => ({
      game: candidate,
      score:
        candidate.categories.filter((item) => game.categories.includes(item)).length * 3 +
        candidate.tags.filter((item) => game.tags.includes(item)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.game);
}

export function validateGameLaunch(game: PublishedGame) {
  try {
    const url = new URL(game.launch.url);
    const allowedOrigin = new URL(game.launch.allowedOrigin);
    if (url.protocol !== "https:" || allowedOrigin.protocol !== "https:") return false;
    if (url.origin !== allowedOrigin.origin) return false;
    if (!game.launch.authorizationReference.trim()) return false;
    if (!["hosted-html5", "authorized-embed", "publisher-sdk"].includes(game.launch.mode)) return false;
    return true;
  } catch {
    return false;
  }
}
