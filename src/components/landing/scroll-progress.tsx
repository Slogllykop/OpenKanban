import { type MotionValue, motion } from "motion/react";

export const ScrollProgress = ({
  progress,
}: {
  progress: MotionValue<number>;
}) => (
  <motion.div
    className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-accent md:h-2"
    style={{ scaleX: progress }}
  />
);
