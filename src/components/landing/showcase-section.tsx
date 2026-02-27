import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

function MockCard({
  h,
  border = "solid",
}: {
  h: string;
  border?: "solid" | "dashed";
}) {
  return (
    <div
      className={`${h} rounded-2xl bg-neutral-900 border ${
        border === "dashed"
          ? "border-dashed border-neutral-700 bg-neutral-900/30"
          : "border-neutral-800 shadow-xl"
      } p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden`}
    >
      {border === "solid" && (
        <>
          <div className="flex gap-2 mb-1">
            <div className="w-8 h-2 rounded bg-neutral-700"></div>
            <div className="w-12 h-2 rounded bg-neutral-800"></div>
          </div>
          <div className="w-[85%] h-3 sm:h-4 rounded bg-neutral-600"></div>
          <div className="w-[50%] h-3 sm:h-4 rounded bg-neutral-700"></div>
          <div className="mt-auto flex justify-between items-center">
            <div className="w-10 h-2 rounded bg-neutral-800"></div>
            <div className="w-6 h-6 rounded-full bg-neutral-800"></div>
          </div>
        </>
      )}
    </div>
  );
}

export function ShowcaseSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -250]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={ref}
      className="h-[90vh] flex items-center justify-center overflow-hidden border-y/0 border-neutral-900 relative pointer-events-none"
    >
      {/* Subtle vignette mask around the edge of the showcase */}
      <div className="absolute inset-0 bg-neutral-950/80 mask-[radial-gradient(ellipse_at_center,transparent_10%,black_80%)] z-10" />

      <div className="flex gap-4 sm:gap-6 md:gap-8 items-start justify-center w-full px-4 max-w-6xl z-0 mt-18">
        {/* Column 1 */}
        <motion.div
          style={{ y: y1 }}
          className="flex flex-col gap-4 w-1/3 max-w-[280px] opacity-60"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="w-16 h-3 rounded-full bg-neutral-700"></div>
            <div className="w-6 h-4 rounded bg-neutral-800 text-[10px] sm:text-xs font-mono text-neutral-500 flex items-center justify-center">
              3
            </div>
          </div>
          <MockCard h="h-32" />
          <MockCard h="h-40" />
          <MockCard h="h-48" />
          <MockCard h="h-24" border="dashed" />
        </motion.div>

        {/* Column 2 (Accent / In Focus) */}
        <motion.div
          style={{ y: y2 }}
          className="flex flex-col gap-4 w-1/3 max-w-[280px] scale-105 sm:scale-110 z-20 mt-12"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]"></div>
              <div className="w-20 h-3 rounded-full bg-neutral-200"></div>
            </div>
            <div className="w-6 h-4 rounded bg-accent/20 text-[10px] sm:text-xs font-mono text-accent font-medium flex items-center justify-center">
              2
            </div>
          </div>

          <MockCard h="h-36" />

          {/* Accent Card */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-b from-accent/50 to-transparent blur opacity-30"></div>
            <div className="relative rounded-2xl bg-black border border-accent/50 p-5 shadow-[0_0_30px_rgba(225,255,0,0.15)] flex flex-col gap-4">
              <div className="w-[90%] h-4 sm:h-5 rounded bg-white"></div>
              <div className="w-[70%] h-4 sm:h-5 rounded bg-neutral-400"></div>
              <div className="mt-2 flex justify-between items-end">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-black"></div>
                  <div className="w-8 h-8 rounded-full bg-accent border-2 border-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  </div>
                </div>
                <div className="w-12 h-2 rounded bg-accent/30"></div>
              </div>
            </div>
          </div>

          <MockCard h="h-32" />
        </motion.div>

        {/* Column 3 */}
        <motion.div
          style={{ y: y3 }}
          className="flex flex-col gap-4 w-1/3 max-w-[280px] opacity-40 mt-[-50px]"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="w-24 h-3 rounded-full bg-neutral-700"></div>
            <div className="w-6 h-4 rounded bg-neutral-800 text-[10px] sm:text-xs font-mono text-neutral-500 flex items-center justify-center">
              5
            </div>
          </div>
          <MockCard h="h-40" />
          <MockCard h="h-28" />
          <MockCard h="h-48" />
          <MockCard h="h-32" />
        </motion.div>
      </div>
    </section>
  );
}
