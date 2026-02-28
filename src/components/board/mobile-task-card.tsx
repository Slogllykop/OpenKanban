"use client";

import {
  IconArrowsRightLeft,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnWithTasks, Priority, Task } from "@/lib/types";

interface MobileTaskCardProps {
  task: Task;
  columns: ColumnWithTasks[];
  isFirst: boolean;
  isLast: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveToColumn: (taskId: string, targetColumnId: string) => void;
  onMoveUp: (taskId: string) => void;
  onMoveDown: (taskId: string) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-priority-low/15 text-priority-low" },
  medium: {
    label: "Med",
    className: "bg-priority-medium/15 text-priority-medium",
  },
  high: {
    label: "High",
    className: "bg-priority-high/15 text-priority-high",
  },
  urgent: {
    label: "Urgent",
    className: "bg-priority-urgent/15 text-priority-urgent",
  },
};

export function MobileTaskCard({
  task,
  columns,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveToColumn,
  onMoveUp,
  onMoveDown,
}: MobileTaskCardProps) {
  const priority = priorityConfig[task.priority];
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Columns that are valid move targets (not the current one)
  const otherColumns = columns.filter((col) => col.id !== task.column_id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised transition-colors duration-150 hover:border-border-hover">
      {/* Main tappable content area */}
      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col p-3 text-left"
        onClick={() => onEdit(task)}
      >
        {/* Title */}
        <p className="wrap-break-word pr-2 font-medium text-sm text-text-primary leading-snug">
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-text-muted text-xs leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer: priority + date */}
        <div className="mt-2.5 flex items-center justify-between">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${priority.className}`}
          >
            {priority.label}
          </span>
          <span className="text-[10px] text-text-muted">
            {new Date(task.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </button>

      {/* Bottom action bar - always visible on mobile */}
      <div className="flex items-center border-border border-t px-2 py-1">
        {/* Move to column dropdown - only shown when there are other columns */}
        {otherColumns.length > 0 ? (
          <DropdownMenu open={showMoveMenu} onOpenChange={setShowMoveMenu}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-1.5 py-1 text-text-muted text-xs transition-colors hover:bg-surface-overlay hover:text-text-secondary">
              <IconArrowsRightLeft size={14} className="opacity-70" />
              <span>Move to</span>
              <IconChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              {otherColumns.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => {
                    onMoveToColumn(task.id, col.id);
                    setShowMoveMenu(false);
                  }}
                  className="cursor-pointer"
                >
                  <IconCheck
                    size={12}
                    className="invisible mr-1 shrink-0"
                    aria-hidden
                  />
                  <span className="max-w-[160px] truncate">{col.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span />
        )}

        {/* Spacer pushes right-side controls to the end */}
        <div className="flex-1" />

        {/* Move up / down within column */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(task.id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move task up"
          >
            <IconChevronUp size={15} stroke={2.5} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(task.id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Move task down"
          >
            <IconChevronDown size={15} stroke={2.5} />
          </button>
        </div>

        {/* Separator */}
        <div className="mx-1.5 h-4 w-px bg-border-hover/50" />

        {/* Delete button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-text-muted text-xs transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete task"
        >
          <IconTrash size={13} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
