"use client";

import { IconPlus } from "@tabler/icons-react";
import { motion } from "motion/react";

interface AddColumnProps {
  onAdd: () => void;
}

export function AddColumn({ onAdd }: AddColumnProps) {
  return (
    <motion.div
      layout
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
        mass: 0.8,
      }}
      style={{ willChange: "transform" }}
      className="h-full shrink-0"
    >
      <button
        type="button"
        onClick={onAdd}
        className="flex h-full w-12 min-w-12 shrink-0 cursor-pointer flex-col items-center rounded-xl border border-border border-dashed bg-surface-base py-4 text-sm text-text-muted transition-all hover:border-border-hover hover:bg-surface-raised hover:text-text-secondary"
      >
        <IconPlus size={18} className="mb-4 shrink-0" />
        <div
          className="flex w-full flex-1 items-start justify-center overflow-hidden py-2"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          <span className="-translate-x-1.5 whitespace-nowrap px-1 font-semibold">
            Add column
          </span>
        </div>
      </button>
    </motion.div>
  );
}
