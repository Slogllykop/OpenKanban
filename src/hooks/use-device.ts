"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Detects whether the current device is mobile based on:
 * 1. User agent string (primary signal - catches tablets/phones)
 * 2. Viewport width < 768px (responsive fallback for resizing)
 *
 * Uses `useSyncExternalStore` for synchronous reads of the viewport state
 * and a hydration guard (`isReady`) so consumers can show a loading state
 * instead of flashing the wrong layout.
 */

const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

const MOBILE_WIDTH_BREAKPOINT = 768;

/* ── External store helpers ─────────────────────────────────────────── */

function detectMobile(): boolean {
  const uaMatch = MOBILE_UA_REGEX.test(navigator.userAgent);
  const widthMatch = window.innerWidth < MOBILE_WIDTH_BREAKPOINT;
  return uaMatch || widthMatch;
}

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(
    `(max-width: ${MOBILE_WIDTH_BREAKPOINT - 1}px)`,
  );
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return detectMobile();
}

function getServerSnapshot(): boolean {
  return false;
}

/* ── Hook ───────────────────────────────────────────────────────────── */

export function useDevice() {
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Hydration guard: stays `false` during SSR and the first (hydration) render,
  // flips to `true` after the component mounts on the client.
  // Consumers should gate rendering on `isReady` to avoid layout‑shift flashes.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return { isMobile, isDesktop: !isMobile, isReady };
}
