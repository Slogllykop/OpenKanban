"use client";

import { IconPlus } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useDevice();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function handleSubmit() {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed);
      setTitle("");
    }
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm shadow-sm transition-all hover:opacity-90 active:scale-[0.98]",
          isMobile ? "bg-accent text-surface-overlay" : "text-text-muted",
        )}
      >
        <IconPlus size={18} stroke={2.5} />
        Add Task
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-surface-overlay p-1 shadow-sm transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
      <div className="flex rounded-lg bg-surface-raised p-1">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setTitle("");
              setIsOpen(false);
            }
          }}
          onBlur={handleSubmit}
          placeholder="What needs to be done?"
          className="w-full flex-1 bg-transparent px-3 py-1.5 font-medium text-sm text-text-primary placeholder-text-muted outline-none"
        />
      </div>
    </div>
  );
}
