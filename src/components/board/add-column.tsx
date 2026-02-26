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
      className="flex h-fit min-w-[280px] shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-text-muted transition-all hover:border-border-hover hover:bg-surface-raised hover:text-text-secondary cursor-pointer"
    >
      <IconPlus size={16} />
      Add column
    </button>
  );
}
