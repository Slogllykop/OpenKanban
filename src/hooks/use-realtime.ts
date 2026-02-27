"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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

  /** Track if we've already shown the error toast to avoid spam */
  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(`board-sync:${slug}`);

    ch.on("broadcast", { event: "sync" }, () => {
      onSyncRef.current();
    });

    ch.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        if (!hasShownErrorRef.current) {
          hasShownErrorRef.current = true;
          toast.error("Realtime sync lost", {
            description:
              "Live updates from other users may be delayed. Refresh to reconnect.",
          });
        }
      }
      if (status === "SUBSCRIBED") {
        hasShownErrorRef.current = false;
      }
    });

    channelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [slug]);

  /** Tell every other viewer to refetch */
  const broadcastSync = useCallback(() => {
    try {
      channelRef.current?.send({
        type: "broadcast",
        event: "sync",
        payload: {},
      });
    } catch {
      // Broadcast failure is non-critical - the local mutation already succeeded.
      // Other clients will eventually sync on their next page load.
    }
  }, []);

  return { broadcastSync };
}
