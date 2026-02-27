import { type MotionValue, motion } from "motion/react";

export const ScrollProgress = ({
  progress,
}: {
  progress: MotionValue<number>;
}) => (
  <motion.div
    className="fixed top-0 left-0 right-0 h-1 md:h-2 bg-accent z-50 origin-left"
    style={{ scaleX: progress }}
  />
);
