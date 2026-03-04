"use client";

import { IconArrowLeft, IconHandStop } from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function RateLimitPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-accent selection:text-black">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
        <span className="select-none font-black font-display text-[30vw] text-accent tracking-tighter mix-blend-screen">
          429
        </span>
      </div>

      <div className="absolute top-0 z-10 flex w-full items-center justify-between p-6 sm:p-8">
        <Logo className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-6 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 text-accent shadow-[0_0_30px_rgba(225,255,0,0.1)]">
          <IconHandStop size={40} stroke={1.5} />
        </div>

        <div className="space-y-3">
          <h1 className="font-bold font-display text-3xl tracking-tight sm:text-4xl">
            Whoa, slow down.
          </h1>
          <p className="font-medium text-neutral-400">
            You've hit the rate limit. OpenKanban is free and open, but we have
            to protect the servers from high traffic.
          </p>
          <p className="text-neutral-500 text-sm">
            Please wait a minute before creating or accessing more boards.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4"
        >
          <Link
            href="/"
            className="group flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-black outline-none transition-all hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <IconArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
