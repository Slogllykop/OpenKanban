"use client";

import { IconPlus } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
        className="flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-text-muted text-xs transition-colors hover:bg-surface-overlay hover:text-text-secondary"
      >
        <IconPlus size={14} />
        Add task
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-2">
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
        placeholder="Task title..."
        className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
      />
    </div>
  );
}
