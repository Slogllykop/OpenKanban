"use client";

import { Droppable } from "@hello-pangea/dnd";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import { AddTask } from "@/components/board/add-task";
import { ColumnHeader } from "@/components/board/column-header";
import { TaskCard } from "@/components/board/task-card";
import type { ColumnWithTasks, Task } from "@/lib/types";

interface ColumnProps {
  column: ColumnWithTasks;
  canDelete: boolean;
  canShiftLeft?: boolean;
  canShiftRight?: boolean;
  onRenameColumn: (columnId: string, title: string) => void;
  onToggleCollapse: (columnId: string, is_collapsed: boolean) => void;
  onDeleteColumn: (columnId: string) => void;
  onShiftLeft?: () => void;
  onShiftRight?: () => void;
  onAddTask: (columnId: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({
  column,
  canDelete,
  canShiftLeft,
  canShiftRight,
  onRenameColumn,
  onToggleCollapse,
  onDeleteColumn,
  onShiftLeft,
  onShiftRight,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  if (column.is_collapsed) {
    return (
      <button
        type="button"
        className="flex h-full w-12 min-w-12 shrink-0 flex-col items-center rounded-xl bg-surface-overlay/30 py-4 cursor-pointer hover:bg-surface-overlay/50 transition-colors border-none text-left"
        onClick={() => onToggleCollapse(column.id, false)}
        aria-label={`Expand ${column.title} column`}
      >
        <span className="text-text-muted hover:text-text-primary mb-4 shrink-0 cursor-pointer">
          <IconLayoutSidebarRightCollapse size={18} className="rotate-180" />
        </span>
        <div
          className="flex-1 w-full flex justify-center items-start overflow-hidden py-2"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          <div className="text-sm font-semibold text-text-muted whitespace-nowrap overflow-hidden text-ellipsis px-1 -translate-x-1.5">
            {column.title}
          </div>
        </div>
        <span className="mt-4 shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-text-muted">
          {column.tasks.length}
        </span>
      </button>
    );
  }

  return (
    <div className="flex h-full w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl bg-surface-overlay/50 p-2">
      <ColumnHeader
        title={column.title}
        taskCount={column.tasks.length}
        canDelete={canDelete}
        canShiftLeft={canShiftLeft}
        canShiftRight={canShiftRight}
        onRename={(title) => onRenameColumn(column.id, title)}
        onToggleCollapse={() => onToggleCollapse(column.id, true)}
        onDelete={() => onDeleteColumn(column.id)}
        onShiftLeft={onShiftLeft}
        onShiftRight={onShiftRight}
      />

      <Droppable
        droppableId={column.id}
        type="task"
        isDropDisabled={column.is_collapsed}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-accent-muted" : ""
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-1 pt-1">
        <AddTask onAdd={(title) => onAddTask(column.id, title)} />
      </div>
    </div>
  );
}
