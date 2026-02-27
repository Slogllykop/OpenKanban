"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconDots,
  IconLayoutSidebarRightCollapse,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface ColumnHeaderProps {
  title: string;
  taskCount: number;
  canDelete: boolean;
  canShiftLeft?: boolean;
  canShiftRight?: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onShiftLeft?: () => void;
  onShiftRight?: () => void;
  onToggleCollapse: () => void;
}

export function ColumnHeader({
  title,
  taskCount,
  canDelete,
  canShiftLeft,
  canShiftRight,
  onRename,
  onDelete,
  onShiftLeft,
  onShiftRight,
  onToggleCollapse,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  function handleSubmit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-2 px-1 pb-3">
      <div className="flex min-w-0 items-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") {
                setEditValue(title);
                setIsEditing(false);
              }
            }}
            className="w-full rounded-md border border-accent bg-surface-raised px-2 py-1 font-semibold text-sm text-text-primary outline-none"
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setIsEditing(true)}
            className="cursor-pointer truncate font-semibold text-sm text-text-primary"
          >
            {title}
          </button>
        )}
        <span className="shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 font-medium text-[10px] text-text-muted">
          {taskCount}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* Collapse column button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary"
          aria-label="Collapse column"
          title="Collapse column"
        >
          <IconLayoutSidebarRightCollapse size={16} />
        </button>

        {/* Column menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary"
          >
            <IconDots size={16} />
          </button>
          {showMenu && (
            <div
              className="absolute top-8 right-0 z-20 w-36 rounded-lg border border-border bg-surface-overlay py-1 shadow-xl"
              style={{ animation: "scale-in 100ms ease-out" }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full cursor-pointer px-3 py-1.5 text-left text-text-secondary text-xs hover:bg-surface-raised hover:text-text-primary"
              >
                <span className="flex items-center gap-1.5">
                  <IconPencil size={12} />
                  Rename
                </span>
              </button>
              {canShiftLeft && (
                <button
                  type="button"
                  onClick={() => {
                    onShiftLeft?.();
                    setShowMenu(false);
                  }}
                  className="w-full cursor-pointer px-3 py-1.5 text-left text-text-secondary text-xs hover:bg-surface-raised hover:text-text-primary"
                >
                  <span className="flex items-center gap-1.5">
                    <IconArrowLeft size={12} />
                    Shift left
                  </span>
                </button>
              )}
              {canShiftRight && (
                <button
                  type="button"
                  onClick={() => {
                    onShiftRight?.();
                    setShowMenu(false);
                  }}
                  className="w-full cursor-pointer px-3 py-1.5 text-left text-text-secondary text-xs hover:bg-surface-raised hover:text-text-primary"
                >
                  <span className="flex items-center gap-1.5">
                    <IconArrowRight size={12} />
                    Shift right
                  </span>
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full cursor-pointer px-3 py-1.5 text-left text-red-400 text-xs hover:bg-red-500/10"
                >
                  <span className="flex items-center gap-1.5">
                    <IconTrash size={12} />
                    Delete column
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
