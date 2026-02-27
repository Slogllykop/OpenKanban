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
    <div className="h-screen sticky top-0 flex flex-col items-center justify-center px-6 overflow-hidden z-10">
      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative flex flex-col items-center text-center w-full max-w-5xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm shadow-xl">
          <Logo size={16} showText={false} />
          <span className="text-xs font-medium tracking-wide text-neutral-300 uppercase">
            One of a kind
          </span>
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-9xl font-display font-bold tracking-tighter leading-[0.9] mb-6 overflow-hidden py-2">
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
            className="block text-transparent bg-clip-text bg-linear-to-r to-white from-neutral-500 px-2"
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
            className="block text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-500 pb-2"
          >
            Sync it.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-lg sm:text-xl md:text-2xl text-neutral-400 max-w-2xl font-light tracking-wide mb-12"
        >
          Your board's privacy is based on{" "}
          <span className="text-white font-medium">your own creativity.</span>
          <br /> No signup. No downloads.
        </motion.p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row w-full max-w-lg gap-3 relative z-20"
        >
          <div className="flex-1 relative group">
            <div className="absolute inset-0 rounded-xl bg-accent blur-md opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-0 rounded-xl border border-neutral-800 bg-black/80 backdrop-blur-xl focus-within:border-accent transition-colors overflow-hidden h-14 sm:h-auto">
              <span className="pl-4 sm:pl-5 text-sm font-medium text-neutral-500 select-none">
                kanban.isdevs.cv/
              </span>
              <input
                // biome-ignore lint/a11y/noAutofocus: Mandatory as a part of the flow.
                autoFocus
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="super-secret-board"
                className="flex-1 bg-transparent py-4 pr-5 pl-1 text-base text-white placeholder-neutral-700 outline-none"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!slug.trim()}
            className="rounded-xl h-14 sm:h-auto bg-accent px-8 py-4 text-sm font-bold tracking-wide text-black transition-all hover:bg-accent-hover border border-accent hover:border-accent-hover hover:shadow-[0_0_20px_rgba(225,255,0,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Create
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
