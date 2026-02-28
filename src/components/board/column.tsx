"use client";

import { Droppable } from "@hello-pangea/dnd";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import { motion } from "motion/react";
import { AddTask } from "@/components/board/add-task";
import { ColumnHeader } from "@/components/board/column-header";
import { TaskCard } from "@/components/board/task-card";
import type { ColumnWithTasks, Task } from "@/lib/types";

const columnTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

const willChangeTransform = { willChange: "transform" } as const;

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
      <motion.div
        layout
        layoutId={column.id}
        transition={columnTransition}
        style={willChangeTransform}
      >
        <button
          type="button"
          className="-z-10 flex h-full w-12 min-w-12 shrink-0 cursor-pointer flex-col items-center rounded-xl border-none bg-surface-column-collapsed py-4 text-left transition-colors hover:bg-surface-overlay/50"
          onClick={() => onToggleCollapse(column.id, false)}
          aria-label={`Expand ${column.title} column`}
        >
          <motion.span
            layout="position"
            className="mb-4 shrink-0 cursor-pointer text-text-muted hover:text-text-primary"
          >
            <IconLayoutSidebarRightCollapse size={18} className="rotate-180" />
          </motion.span>
          <motion.div
            layout="position"
            className="flex w-full flex-1 items-start justify-center overflow-hidden py-2"
            style={{ writingMode: "vertical-rl", rotate: 180 }}
          >
            <div className="-translate-x-1.5 overflow-hidden text-ellipsis whitespace-nowrap px-1 font-semibold text-sm text-text-muted">
              {column.title}
            </div>
          </motion.div>
          <motion.span
            layout="position"
            className="mt-4 shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 font-medium text-[10px] text-text-muted"
          >
            {column.tasks.length}
          </motion.span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      layoutId={column.id}
      transition={columnTransition}
      style={willChangeTransform}
      className="z-10 flex h-full w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl bg-surface-column p-2"
    >
      <motion.div layout="position">
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
      </motion.div>

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
    </motion.div>
  );
}
