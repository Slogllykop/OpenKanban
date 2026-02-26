"use client";

import { IconPlus } from "@tabler/icons-react";

interface AddColumnProps {
  onAdd: () => void;
}

export function AddColumn({ onAdd }: AddColumnProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex h-full w-12 min-w-12 shrink-0 flex-col items-center rounded-xl border border-dashed border-border py-4 text-sm text-text-muted transition-all hover:border-border-hover hover:bg-surface-raised hover:text-text-secondary cursor-pointer"
    >
      <IconPlus size={18} className="shrink-0 mb-4" />
      <div
        className="flex-1 w-full flex justify-center items-start overflow-hidden py-2"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        <span className="whitespace-nowrap font-semibold px-1 -translate-x-1.5">
          Add column
        </span>
      </div>
    </button>
  );
}
