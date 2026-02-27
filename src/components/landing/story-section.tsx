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
      className="mb-32 flex min-h-[60vh] items-center px-6 md:px-24"
    >
      <motion.div
        style={{ opacity, y, scale }}
        className={`relative w-full max-w-4xl ${align === "right" ? "ml-auto text-right" : ""}`}
      >
        {/* Subtle large background number */}
        <div
          className={`absolute top-[-20%] ${align === "right" ? "right-[-10%]" : "left-[-10%]"} -z-10 pointer-events-none select-none font-bold font-display text-[20vw] text-neutral-900 leading-none`}
        >
          0{index}
        </div>

        <h3 className="mb-6 flex items-center justify-start gap-4 font-medium text-accent text-xs uppercase tracking-[0.3em] md:text-sm">
          {align === "right" && (
            <span className="h-px flex-1 bg-neutral-800"></span>
          )}
          {subtitle}
          {align === "left" && (
            <span className="h-px flex-1 bg-neutral-800"></span>
          )}
        </h3>
        <h2 className="mb-8 font-bold font-display text-5xl leading-[1.1] tracking-tighter sm:text-6xl md:text-8xl">
          {title}
        </h2>
        <p className="inline-block max-w-2xl font-light text-neutral-400 text-xl leading-relaxed sm:text-2xl md:text-3xl">
          {text}
        </p>
      </motion.div>
    </section>
  );
}
