"use client";
import { useState } from "react";
export default function GameActions({ slug, title, favoriteLabel, shareLabel }: { slug: string; title: string; favoriteLabel: string; shareLabel: string }) {
  const [favorite, setFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const toggleFavorite = () => {
    try {
      const key = "playnova:favorites";
      const current = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      localStorage.setItem(key, JSON.stringify(next));
      setFavorite(next.includes(slug));
    } catch { setMessage("Favorites are unavailable in this browser."); }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(window.location.href); setMessage("Link copied."); }
      else setMessage("Sharing is not supported in this browser.");
    } catch { setMessage("Sharing was cancelled or unavailable."); }
  };
  return <div className="game-page-actions">
    <button type="button" onClick={toggleFavorite} aria-pressed={favorite}>♡ {favorite ? "Saved" : favoriteLabel}</button>
    <button type="button" onClick={share}>{shareLabel}</button>
    <span className="sr-only" aria-live="polite">{message}</span>
  </div>;
}
