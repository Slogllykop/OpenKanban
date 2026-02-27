import { motion } from "motion/react";

export function CallToAction() {
  return (
    <section className="relative z-20 py-20 px-6 flex flex-col items-center justify-center text-center border-t border-neutral-900 bg-neutral-950">
      <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-12">
        Ready to <span className="text-accent">organize?</span>
      </h2>
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-white px-10 py-5 text-sm md:text-base font-bold tracking-[0.2em] uppercase text-black transition-all hover:bg-neutral-200 shadow-[0_0_40px_rgba(255,255,0,0.1)]"
      >
        Create Your first Board
      </motion.button>
    </section>
  );
}
