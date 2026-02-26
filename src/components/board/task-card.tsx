"use client";

import { Draggable } from "@hello-pangea/dnd";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import type { Priority, Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-priority-low/15 text-priority-low" },
  medium: {
    label: "Med",
    className: "bg-priority-medium/15 text-priority-medium",
  },
  high: { label: "High", className: "bg-priority-high/15 text-priority-high" },
  urgent: {
    label: "Urgent",
    className: "bg-priority-urgent/15 text-priority-urgent",
  },
};

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          role="button"
          tabIndex={0}
          onClick={() => onEdit(task)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEdit(task);
            }
          }}
          className={`group relative cursor-pointer rounded-lg border bg-surface-raised p-3 transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-accent ${
            snapshot.isDragging
              ? "border-accent/40 shadow-lg shadow-accent/5 rotate-1 scale-[1.02]"
              : "border-border hover:border-border-hover"
          }`}
        >
          {/* Drag handle — visible on hover or keyboard focus */}
          <div
            {...provided.dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute top-3 left-1.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          >
            <IconGripVertical size={14} />
          </div>

          {/* Content */}
          <div className="pl-4">
            <p className="text-sm font-medium text-text-primary leading-snug">
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Footer: priority + date */}
          <div className="mt-2.5 flex items-center justify-between pl-4">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priority.className}`}
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

          {/* Delete button — visible on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 rounded-md p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </Draggable>
  );
}
