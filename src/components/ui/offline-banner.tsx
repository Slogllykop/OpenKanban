"use client";

import { IconWifiOff } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * A slim, fixed-position banner that appears at the top of the viewport
 * when the user goes offline. Uses accent colors for high visibility.
 * Automatically dismisses when connectivity is restored.
 */
export function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="w-full overflow-hidden"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-center gap-2 bg-accent px-4 py-2 font-medium text-sm text-text-inverse">
            <IconWifiOff size={16} />
            <span>You are currently offline - changes may not be saved</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
