"use client";

import { useRef, useState } from "react";
import type { LaunchMode, GamePermissions } from "@/lib/games";

type LaunchConfig = {
  mode: LaunchMode;
  url: string;
  allowedOrigin: string;
  permissions: GamePermissions;
  authorizationReference: string;
};

type Props = {
  launch: LaunchConfig;
  title: string;
  unavailableText: string;
  emptyText: string;
};

function getSafeLaunchUrl(config: LaunchConfig) {
  try {
    const url = new URL(config.url);
    const origin = new URL(config.allowedOrigin);
    if (url.protocol !== "https:" || origin.protocol !== "https:" || url.origin !== origin.origin) return null;
    if (!config.authorizationReference.trim()) return null;
    if (config.mode === "publisher-sdk") return null;
    return url.href;
  } catch {
    return null;
  }
}

export default function GamePlayer({ launch, title, unavailableText, emptyText }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const safeUrl = getSafeLaunchUrl(launch);

  const start = () => {
    if (!safeUrl) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setLoaded(false);
    setStarted(true);
  };

  const retry = () => {
    setFailed(false);
    setLoaded(false);
    setStarted(false);
    window.setTimeout(() => setStarted(true), 0);
  };

  const fullscreen = async () => {
    const frame = frameRef.current;
    if (!frame || !launch.permissions.fullscreen) return;
    try {
      await frame.requestFullscreen();
    } catch {
      setFailed(true);
    }
  };

  return (
    <section className="game-player-shell" aria-label={title}>
      <div className="game-player-toolbar">
        <span>{started && loaded ? title : unavailableText}</span>
        <button type="button" onClick={fullscreen} disabled={!started || !loaded || !launch.permissions.fullscreen}>
          ⛶ Fullscreen
        </button>
      </div>
      <div className="game-player-stage">
        {!started && !failed && (
          <div className="game-player-overlay">
            <span className="game-player-icon" aria-hidden="true">▶</span>
            <strong>{emptyText}</strong>
            <button type="button" className="game-player-start" onClick={start} disabled={!safeUrl || launch.mode === "publisher-sdk"}>
              {safeUrl ? "Start game" : unavailableText}
            </button>
          </div>
        )}
        {started && !loaded && !failed && <div className="game-player-status" role="status">Loading game…</div>}
        {failed && <div className="game-player-overlay" role="alert"><strong>Game could not be loaded.</strong><button type="button" className="game-player-start" onClick={retry}>Retry</button></div>}
        {started && safeUrl && (
          <iframe
            key={safeUrl}
            ref={frameRef}
            src={safeUrl}
            title={title}
            className="game-player-frame"
            sandbox="allow-scripts allow-pointer-lock"
            allow={`${launch.permissions.fullscreen ? "fullscreen; " : ""}${launch.permissions.pointerLock ? "pointer-lock; " : ""}`}
            allowFullScreen={launch.permissions.fullscreen}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <p className="game-player-security-note">{unavailableText}</p>
    </section>
  );
}
