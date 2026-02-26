"use client";

import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  slug: string;
  /** Called when another client mutates the board */
  onSync: () => void;
}

/**
 * Simple broadcast channel for board sync.
 *
 * After any DB write the local client calls `broadcastSync()`.
 * All OTHER clients on the same board receive the "sync" event
 * and re-fetch the latest state from the database.
 *
 * Supabase Broadcast does NOT echo events back to the sender,
 * so the mutating client never triggers its own refetch.
 */
export function useRealtime({ slug, onSync }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(`board-sync:${slug}`);

    ch.on("broadcast", { event: "sync" }, () => {
      onSyncRef.current();
    });

    ch.subscribe();
    channelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [slug]);

  /** Tell every other viewer to refetch */
  const broadcastSync = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "sync",
      payload: {},
    });
  }, []);

  return { broadcastSync };
}
