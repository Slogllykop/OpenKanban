"use client";

import { type RefObject, useEffect } from "react";

/**
 * Hook that calls a handler when a click (mousedown) occurs outside
 * the element referenced by `ref`. The listener is only attached
 * when `enabled` is true, keeping it lightweight.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [ref, handler, enabled]);
}
