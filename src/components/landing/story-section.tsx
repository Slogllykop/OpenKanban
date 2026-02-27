import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function StorySection({
  title,
  subtitle,
  text,
  align,
  index,
}: {
  title: string;
  subtitle: string;
  text: string;
  align: "left" | "right";
  index: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.5 0.5"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <section
      ref={ref}
      className="min-h-[60vh] flex items-center px-6 md:px-24 mb-32"
    >
      <motion.div
        style={{ opacity, y, scale }}
        className={`w-full max-w-4xl relative ${align === "right" ? "ml-auto text-right" : ""}`}
      >
        {/* Subtle large background number */}
        <div
          className={`absolute top-[-20%] ${align === "right" ? "right-[-10%]" : "left-[-10%]"} text-[20vw] font-display font-bold text-neutral-900 select-none pointer-events-none -z-10 leading-none`}
        >
          0{index}
        </div>

        <h3 className="text-accent font-medium tracking-[0.3em] uppercase text-xs md:text-sm mb-6 flex items-center gap-4 justify-start">
          {align === "right" && (
            <span className="flex-1 h-px bg-neutral-800"></span>
          )}
          {subtitle}
          {align === "left" && (
            <span className="flex-1 h-px bg-neutral-800"></span>
          )}
        </h3>
        <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-[1.1]">
          {title}
        </h2>
        <p className="text-xl sm:text-2xl md:text-3xl text-neutral-400 font-light leading-relaxed max-w-2xl inline-block">
          {text}
        </p>
      </motion.div>
    </section>
  );
}
