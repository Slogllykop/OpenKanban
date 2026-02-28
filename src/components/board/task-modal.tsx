"use client";

import {
  IconAlignLeft,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconFlag,
  IconTrash,
  IconTypography,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <div className="flex flex-col gap-6">
        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="task-title"
            className="flex items-center gap-1.5 font-semibold text-[0.75rem] text-text-muted uppercase tracking-wider"
          >
            <IconTypography size={14} /> Task Title
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            placeholder="What needs to be done?"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2.5 font-medium text-base text-text-primary outline-none transition-colors placeholder:text-text-muted/50 hover:border-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="task-desc"
            className="flex items-center gap-1.5 font-semibold text-[0.75rem] text-text-muted uppercase tracking-wider"
          >
            <IconAlignLeft size={14} /> Description{" "}
            <span className="font-normal normal-case opacity-50">
              (optional)
            </span>
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Add more details about this task..."
            className="w-full resize-none rounded-md border border-border bg-transparent px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/50 hover:border-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Metadata section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-[0.75rem] text-text-muted uppercase tracking-wider">
              <IconFlag size={14} /> Priority
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-[42px] w-full items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 font-medium text-sm text-text-primary outline-none transition-colors hover:border-text-muted focus:border-accent data-[status=open]:border-accent">
                <span>
                  {priorityOptions.find((o) => o.value === priority)?.label}
                </span>
                <IconChevronDown size={16} className="text-text-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-(--anchor-width) border border-border bg-surface-raised"
              >
                {priorityOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    {opt.label}
                    {priority === opt.value && <IconCheck size={14} />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Created Status */}
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-[0.75rem] text-text-muted uppercase tracking-wider">
              <IconCalendar size={14} /> Created
            </span>
            <div className="flex h-[42px] items-center rounded-md border border-transparent bg-transparent px-3 py-2 font-medium text-sm text-text-secondary">
              {task
                ? new Date(task.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-"}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between border-border border-t pt-5">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="hover:bg-red-500/10"
          >
            <IconTrash size={16} className="mr-1.5" />
            Delete Task
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-text-muted hover:bg-black/10 hover:text-text-primary dark:hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-5 font-semibold shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
