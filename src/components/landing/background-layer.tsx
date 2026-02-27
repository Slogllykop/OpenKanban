import { type MotionValue, motion, useTransform } from "motion/react";

export const BackgroundLayer = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  const bgRotate1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const bgRotate2 = useTransform(scrollYProgress, [0, 1], [360, 180]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 500]);

  const bottomBgY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -800]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="mask-[radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-size-[4rem_4rem]" />

      <motion.div
        style={{ rotate: bgRotate1, y: bgY }}
        className="absolute top-[-10%] left-[-10%] h-[80vw] w-[80vw] rounded-full border border-neutral-800/50 opacity-80 blur-[2px]"
      />
      <motion.div
        style={{
          rotate: bgRotate2,
          y: bottomBgY,
        }}
        className="absolute right-[-10%] bottom-[-20%] h-[60vw] w-[60vw] rounded-full border border-accent/20 border-dashed opacity-60 blur-[1px]"
      />

      {/* Glowing Orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-[20%] left-[10%] h-[30vw] w-[30vw] rounded-full bg-accent/5 blur-[100px]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute top-[60%] right-[10%] h-[40vw] w-[40vw] rounded-full bg-white/5 blur-[120px]"
      />
    </div>
  );
};
