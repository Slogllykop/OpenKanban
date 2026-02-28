"use client";

import type { PanInfo } from "motion/react";
import { useCallback, useState } from "react";

/** Minimum horizontal drag distance (px) to trigger a column switch */
const SWIPE_THRESHOLD = 50;

/** Minimum horizontal velocity (px/s) to trigger a fast flick */
const VELOCITY_THRESHOLD = 300;

/**
 * Manages column navigation state for the mobile board.
 * Tracks the active column index + swipe direction so both
 * navigation buttons and drag gestures can drive the same
 * AnimatePresence animation.
 *
 * @param totalColumns – current number of columns
 * @returns navigation state & handlers to wire into the UI
 */
export function useColumnSwipe(totalColumns: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Direction of the last navigation:
   *  1 = moving forward  (swipe left / next button)
   * -1 = moving backward (swipe right / prev button)
   *  0 = no navigation yet
   */
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);

  // Clamp activeIndex when columns are added/removed
  const safeIndex = Math.min(activeIndex, Math.max(0, totalColumns - 1));

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => Math.min(totalColumns - 1, i + 1));
  }, [totalColumns]);

  /** Navigate directly to a specific index */
  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalColumns - 1, index));
      setDirection(clamped > safeIndex ? 1 : -1);
      setActiveIndex(clamped);
    },
    [totalColumns, safeIndex],
  );

  /** Drag-end handler – decides whether the swipe was large/fast enough */
  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      const swipedLeft =
        offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
      const swipedRight =
        offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;

      if (swipedLeft && safeIndex < totalColumns - 1) {
        goToNext();
      } else if (swipedRight && safeIndex > 0) {
        goToPrev();
      }
    },
    [safeIndex, totalColumns, goToNext, goToPrev],
  );

  return {
    /** Clamped active column index */
    safeIndex,
    /** Direction of last navigation (-1 | 0 | 1) for AnimatePresence */
    direction,
    goToPrev,
    goToNext,
    goTo,
    /** Wire this into the motion.div's onDragEnd prop */
    onDragEnd,
  } as const;
}
