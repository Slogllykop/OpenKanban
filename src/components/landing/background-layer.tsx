import { type MotionValue, motion, useTransform } from "motion/react";

export const BackgroundLayer = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -800]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Glowing Orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-[20%] left-[10%] h-[30vw] w-[30vw] rounded-full bg-accent/3 blur-[100px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute top-[60%] right-[10%] h-[40vw] w-[40vw] rounded-full bg-white/4 blur-[120px]"
      />
    </div>
  );
};
