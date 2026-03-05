"use client";

import { useEffect } from "react";

interface HotKeyBinding {
  /** The key to listen for (e.g. "j", "ArrowUp", "ArrowDown") */
  key: string;
  /** Whether Ctrl (Win/Linux) or Cmd (Mac) must be held */
  ctrlOrCmd: boolean;
  /** Callback to invoke when the hotkey fires */
  action: () => void;
}

/**
 * Register global keyboard shortcuts that work across Mac, Windows, and Linux.
 *
 * - Shortcuts are skipped when an input, textarea, or contenteditable element is focused.
 * - The `ctrlOrCmd` flag matches `metaKey` on macOS and `ctrlKey` elsewhere.
 * - Default browser behavior is prevented for matched combos.
 */
export function useHotKeys(bindings: HotKeyBinding[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when the user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      const isMac =
        typeof navigator !== "undefined" &&
        /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

      for (const binding of bindings) {
        const modifierPressed = isMac ? e.metaKey : e.ctrlKey;

        if (
          binding.ctrlOrCmd &&
          modifierPressed &&
          !e.shiftKey &&
          !e.altKey &&
          e.key.toLowerCase() === binding.key.toLowerCase()
        ) {
          e.preventDefault();
          e.stopPropagation();
          binding.action();
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bindings]);
}
