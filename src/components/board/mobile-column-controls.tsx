"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconLayoutColumns,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface MobileColumnControlsProps {
  title: string;
  taskCount: number;
  currentIndex: number;
  totalColumns: number;
  canDelete: boolean;
  canShiftLeft: boolean;
  canShiftRight: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRename: (title: string) => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  onDelete: () => void;
  onAddColumn: () => void;
}

export function MobileColumnControls({
  title,
  taskCount,
  currentIndex,
  totalColumns,
  canDelete,
  canShiftLeft,
  canShiftRight,
  onPrev,
  onNext,
  onRename,
  onShiftLeft,
  onShiftRight,
  onDelete,
  onAddColumn,
}: MobileColumnControlsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync edit value when title changes externally
  useEffect(() => {
    setEditValue(title);
  }, [title]);

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

  function handleRenameSubmit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  }

  return (
    <div className="relative mx-4 mb-4 flex flex-col rounded-b-2xl border border-border bg-surface-overlay p-4 shadow-sm transition-all">
      {/* Decorative top gradient edge */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-accent" />

      <div className="mt-1 flex items-start justify-between gap-3">
        {/* Left section: Meta and Title */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2 font-medium text-[11px] text-text-muted uppercase tracking-wide">
            <span>
              Column {currentIndex + 1} of {totalColumns}
            </span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-border-hover" />
            <span className="text-accent">
              {taskCount} Task{taskCount !== 1 && "s"}
            </span>
          </div>

          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") {
                  setEditValue(title);
                  setIsEditing(false);
                }
              }}
              className="w-full rounded-lg border border-accent bg-surface-raised px-3 py-1.5 font-bold text-lg text-text-primary outline-none transition-all focus:ring-2 focus:ring-accent/20"
            />
          ) : (
            <button
              type="button"
              onDoubleClick={() => setIsEditing(true)}
              className="max-w-full truncate text-left font-bold text-text-primary text-xl tracking-tight transition-colors hover:text-accent"
              title={`${title} (double-tap to rename)`}
            >
              {title}
            </button>
          )}
        </div>
      </div>

      {/* Unified actions row */}
      <div className="mt-1 mb-2 flex h-10 items-center gap-2">
        {/* Navigation Pill */}
        <div className="flex h-full items-center overflow-hidden rounded-xl border border-border bg-surface-raised">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex h-full w-10 items-center justify-center text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous column"
          >
            <IconChevronLeft size={18} stroke={2.5} />
          </button>
          <div className="h-4 w-px bg-border-hover/50" />
          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex === totalColumns - 1}
            className="flex h-full w-10 items-center justify-center text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next column"
          >
            <IconChevronRight size={18} stroke={2.5} />
          </button>
        </div>

        {/* Add Column Button */}
        <button
          type="button"
          onClick={onAddColumn}
          className="group flex h-full flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-raised px-4 font-medium text-sm text-text-primary transition-colors hover:border-border-hover hover:bg-surface-overlay active:scale-[0.98]"
          aria-label="Add new column"
        >
          <IconLayoutColumns
            size={16}
            stroke={2}
            className="text-accent transition-colors group-hover:text-accent"
          />
          <span className="translate-y-px">New Column</span>
        </button>

        {/* Settings Menu */}
        <div className="relative h-full shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-full w-10 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted transition-colors hover:border-border-hover hover:bg-surface-overlay hover:text-text-primary"
            aria-label="Column options"
          >
            <IconDots size={20} stroke={2.5} />
          </button>

          {showMenu && (
            <div
              className="absolute top-12 right-0 z-20 w-48 rounded-xl border border-border bg-surface-overlay p-1.5 shadow-xl"
              style={{
                animation: "scale-in 150ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="mb-1 px-2 py-1 font-semibold text-[10px] text-text-muted uppercase tracking-wider">
                Column Actions
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
              >
                <IconPencil size={16} stroke={2} className="text-text-muted" />
                Rename
              </button>

              {canShiftLeft && (
                <button
                  type="button"
                  onClick={() => {
                    onShiftLeft();
                    setShowMenu(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                >
                  <IconArrowLeft
                    size={16}
                    stroke={2}
                    className="text-text-muted"
                  />
                  Shift left
                </button>
              )}

              {canShiftRight && (
                <button
                  type="button"
                  onClick={() => {
                    onShiftRight();
                    setShowMenu(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-sm text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                >
                  <IconArrowRight
                    size={16}
                    stroke={2}
                    className="text-text-muted"
                  />
                  Shift right
                </button>
              )}

              {canDelete && (
                <>
                  <div className="my-1 h-px w-full bg-border" />
                  <button
                    type="button"
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-red-500 text-sm transition-colors hover:bg-red-500/10"
                  >
                    <IconTrash
                      size={16}
                      stroke={2}
                      className="text-red-500/80"
                    />
                    Delete column
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-1 flex h-1.5 gap-1.5">
        {Array.from({ length: totalColumns }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: order is stable for dot indicators
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ease-out ${
              i === currentIndex
                ? "bg-accent"
                : i < currentIndex
                  ? "bg-border-hover/80"
                  : "bg-surface-raised"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
