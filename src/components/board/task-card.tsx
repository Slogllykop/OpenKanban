/** biome-ignore-all lint/a11y/noStaticElementInteractions: handled by dnd package  */
/** biome-ignore-all lint/a11y/useSemanticElements: nested buttons */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: handled by dragHandleProps */
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
          onClick={() => onEdit(task)}
          className={`group relative cursor-pointer rounded-lg border bg-surface-raised p-3 outline-none transition-all duration-150 has-focus-visible:ring-1 has-focus-visible:ring-accent ${
            snapshot.isDragging
              ? "scale-[1.02] border-accent/40 shadow-accent/5 shadow-lg"
              : "border-border hover:border-border-hover"
          }`}
        >
          {/* Drag handle — visible on hover or keyboard focus */}
          <div
            {...provided.dragHandleProps}
            role="button"
            tabIndex={0}
            aria-label={`Task: ${task.title}. Press Space to move, Enter to edit.`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEdit(task);
              }
              //   else if (provided.dragHandleProps?.onKeyDown) {
              //     provided.dragHandleProps.onKeyDown(e);
              //   }
            }}
            className="absolute top-3 left-1.5 text-text-muted opacity-0 transition-opacity focus:opacity-100 focus:outline-none group-hover:opacity-100"
          >
            <IconGripVertical size={14} />
          </div>

          {/* Content */}
          <div className="pl-4">
            <p className="font-medium text-sm text-text-primary leading-snug">
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-text-muted text-xs leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Footer: priority + date */}
          <div className="mt-2.5 flex items-center justify-between pl-4">
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

          {/* Delete button - visible on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 cursor-pointer rounded-md p-1 text-text-muted opacity-0 transition-colors hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent group-hover:opacity-100"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </Draggable>
  );
}
