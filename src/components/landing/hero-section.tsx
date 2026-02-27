import { type MotionValue, motion, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

export const HeroSection = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  const [slug, setSlug] = useState("");
  const router = useRouter();

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const trimmed = slug.trim();
    if (!trimmed) return;
    router.push(`/${trimmed}`);
  }

  return (
    <div className="sticky top-0 z-10 flex h-[80vh] flex-col items-center justify-center overflow-hidden px-6 lg:h-[90dvh]">
      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative flex w-full max-w-5xl flex-col items-center text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 shadow-xl backdrop-blur-sm">
          <Logo size={16} showText={false} />
          <span className="font-medium text-neutral-300 text-xs uppercase tracking-wide">
            One of a kind
          </span>
        </div>

        <h1 className="mb-6 overflow-hidden py-2 font-bold font-display text-6xl leading-[0.9] tracking-tighter sm:text-7xl md:text-9xl">
          <span className="sr-only">
            OpenKanban - Free Real-time Kanban Board.
          </span>
          <motion.span
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="block bg-linear-to-r from-neutral-500 to-white bg-clip-text px-2 text-transparent"
          >
            Think it.
          </motion.span>
          <motion.span
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="block bg-linear-to-r from-white to-neutral-500 bg-clip-text pb-2 text-transparent"
          >
            Sync it.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mb-12 max-w-2xl font-light text-lg text-neutral-400 tracking-wide sm:text-xl md:text-2xl"
        >
          Your board's privacy is based on{" "}
          <span className="font-medium text-white">your own creativity.</span>
          <br /> No signup. No downloads.
        </motion.p>

        <form
          onSubmit={handleSubmit}
          className="relative z-20 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
        >
          <div className="group relative flex-1">
            <div className="absolute inset-0 rounded-xl bg-accent opacity-0 blur-md transition-opacity duration-500 group-focus-within:opacity-20"></div>
            <div className="relative flex h-14 items-center gap-0 overflow-hidden rounded-xl border border-neutral-800 bg-black/80 backdrop-blur-xl transition-colors focus-within:border-accent sm:h-auto">
              <span className="shrink-0 select-none pl-3 font-medium text-neutral-500 text-xs sm:pl-5 sm:text-sm">
                kanban.isdevs.cv/
              </span>
              <input
                // biome-ignore lint/a11y/noAutofocus: Mandatory as a part of the flow.
                autoFocus
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="super-secret-board"
                className="min-w-0 flex-1 bg-transparent py-4 pr-4 pl-1 text-sm text-white placeholder-neutral-700 outline-none sm:text-base"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!slug.trim()}
            className="h-14 rounded-xl border border-accent bg-accent px-8 py-4 font-bold text-black text-sm tracking-wide transition-all hover:border-accent-hover hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(225,255,0,0.3)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none sm:h-auto"
          >
            Create
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
