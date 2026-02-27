"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Priority, Task } from "@/lib/types";

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    taskId: string,
    updates: {
      title?: string;
      description?: string | null;
      priority?: Priority;
    },
  ) => void;
  onDelete: (taskId: string) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskModal({
  task,
  open,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
    }
  }, [task]);

  function handleSave() {
    if (!task || !title.trim()) return;
    onSave(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
    });
    onClose();
  }

  function handleDelete() {
    if (!task) return;
    onDelete(task.id);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-title"
            className="font-medium text-text-secondary text-xs"
          >
            Title
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-desc"
            className="font-medium text-text-secondary text-xs"
          >
            Description
            <span className="ml-1 text-text-muted">(optional)</span>
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
            placeholder="Add a description..."
          />
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-priority"
            className="font-medium text-text-secondary text-xs"
          >
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full cursor-pointer rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Created date (read-only) */}
        {task && (
          <p className="text-text-muted text-xs">
            Created{" "}
            {new Date(task.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete task
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
