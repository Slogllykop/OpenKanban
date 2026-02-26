"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Tracks the number of viewers on a board using Supabase Presence.
 * Each viewer gets a random ID on mount and is tracked/untracked on the channel.
 */
export function usePresence(slug: string) {
  const [viewerCount, setViewerCount] = useState(1);

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
        await ch.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      ch.untrack();
      supabase.removeChannel(ch);
    };
  }, [slug]);

  return { viewerCount };
}
