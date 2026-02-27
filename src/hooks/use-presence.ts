"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Tracks the number of viewers on a board using Supabase Presence.
 * Each viewer gets a random ID on mount and is tracked/untracked on the channel.
 * Gracefully degrades on subscription or tracking errors.
 */
export function usePresence(slug: string) {
  const [viewerCount, setViewerCount] = useState(1);

  /** Track if we've already shown the error toast to avoid spam */
  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(`board:${slug}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      const count = Object.keys(state).length;
      setViewerCount(Math.max(count, 1));
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        hasShownErrorRef.current = false;
        try {
          await ch.track({ online_at: new Date().toISOString() });
        } catch {
          // Track failure is non-critical - viewer count may be inaccurate
        }
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        if (!hasShownErrorRef.current) {
          hasShownErrorRef.current = true;
          toast.error("Presence unavailable", {
            description:
              "Live viewer count may be inaccurate. This does not affect your work.",
          });
        }
      }
    });

    return () => {
      ch.untrack();
      supabase.removeChannel(ch);
    };
  }, [slug]);

  return { viewerCount };
}
