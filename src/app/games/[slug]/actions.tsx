"use client";

import { useEffect, useState } from "react";

const FAVORITES_KEY = "playnova-favorites";
const LEGACY_FAVORITES_KEY = "playnova:favorites";

function readFavorites(): string[] {
  try {
    const current = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    const legacy = JSON.parse(localStorage.getItem(LEGACY_FAVORITES_KEY) || "[]");
    const values = [...(Array.isArray(current) ? current : []), ...(Array.isArray(legacy) ? legacy : [])];
    const unique = [...new Set(values.filter((item): item is string => typeof item === "string").map((item) => item.slice(0, 160)))];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(unique));
    localStorage.removeItem(LEGACY_FAVORITES_KEY);
    return unique;
  } catch {
    return [];
  }
}

export default function GameActions({
  slug, title, favoriteLabel, shareLabel, locale = "ar",
}: {
  slug: string;
  title: string;
  favoriteLabel: string;
  shareLabel: string;
  locale?: "ar" | "en";
}) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const toggleFavorite = () => {
    try {
      const current = readFavorites();
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(next)]));
      setFavorites(next);
      setMessage(locale === "ar"
        ? (next.includes(slug) ? "تمت الإضافة إلى المفضلة." : "تمت الإزالة من المفضلة.")
        : (next.includes(slug) ? "Added to favorites." : "Removed from favorites."));
    } catch {
      setMessage(locale === "ar" ? "تعذر حفظ المفضلة في هذا المتصفح." : "Favorites could not be saved in this browser.");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setMessage(locale === "ar" ? "تم نسخ الرابط." : "Link copied.");
      } else setMessage(locale === "ar" ? "المشاركة غير مدعومة في هذا المتصفح." : "Sharing is not supported in this browser.");
    } catch {
      setMessage(locale === "ar" ? "تم إلغاء المشاركة أو تعذرت." : "Sharing was cancelled or unavailable.");
    }
  };

  const favorite = favorites.includes(slug);
  return (
    <div className="game-page-actions">
      <button type="button" onClick={toggleFavorite} aria-pressed={favorite}>
        {favorite ? "♥" : "♡"} {favorite ? (locale === "ar" ? "إزالة من المفضلة" : "Remove favorite") : favoriteLabel}
      </button>
      <button type="button" onClick={share}>{shareLabel}</button>
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  );
}
