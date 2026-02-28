"use client";

import { useState } from "react";
import { AddTask } from "@/components/board/add-task";
import { MobileColumnControls } from "@/components/board/mobile-column-controls";
import { MobileTaskCard } from "@/components/board/mobile-task-card";
import type { ColumnWithTasks, Task } from "@/lib/types";

interface MobileBoardProps {
  columns: ColumnWithTasks[];
  onAddColumn: () => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onShiftColumn: (fromIndex: number, toIndex: number) => void;
  onAddTask: (columnId: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (
    sourceColId: string,
    destColId: string,
    sourceIndex: number,
    destIndex: number,
  ) => void;
  onRequestDeleteColumn: (columnId: string) => void;
}

export function MobileBoard({
  columns,
  onAddColumn,
  onRenameColumn,
  onShiftColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onRequestDeleteColumn,
}: MobileBoardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Clamp activeIndex when columns shrink (e.g. after deletion)
  const safeIndex = Math.min(activeIndex, Math.max(0, columns.length - 1));
  const activeColumn = columns[safeIndex];

  function goToPrev() {
    setActiveIndex((i) => Math.max(0, i - 1));
  }

  function goToNext() {
    setActiveIndex((i) => Math.min(columns.length - 1, i + 1));
  }

  function handleShiftLeft() {
    if (safeIndex === 0) return;
    onShiftColumn(safeIndex, safeIndex - 1);
    setActiveIndex(safeIndex - 1);
  }

  function handleShiftRight() {
    if (safeIndex >= columns.length - 1) return;
    onShiftColumn(safeIndex, safeIndex + 1);
    setActiveIndex(safeIndex + 1);
  }

  function handleDeleteColumn() {
    if (!activeColumn) return;
    onRequestDeleteColumn(activeColumn.id);
    // Navigate left if possible after deletion (handled after confirm)
    if (safeIndex > 0) {
      setActiveIndex(safeIndex - 1);
    }
  }

  function handleMoveTaskToColumn(taskId: string, targetColumnId: string) {
    if (!activeColumn) return;
    const sourceIndex = activeColumn.tasks.findIndex((t) => t.id === taskId);
    if (sourceIndex === -1) return;

    const targetCol = columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    // Append to the end of the target column
    const destIndex = targetCol.tasks.length;
    onMoveTask(activeColumn.id, targetColumnId, sourceIndex, destIndex);
  }

  function handleMoveTaskUp(taskId: string) {
    if (!activeColumn) return;
    const index = activeColumn.tasks.findIndex((t) => t.id === taskId);
    if (index <= 0) return;
    onMoveTask(activeColumn.id, activeColumn.id, index, index - 1);
  }

  function handleMoveTaskDown(taskId: string) {
    if (!activeColumn) return;
    const index = activeColumn.tasks.findIndex((t) => t.id === taskId);
    if (index === -1 || index >= activeColumn.tasks.length - 1) return;
    onMoveTask(activeColumn.id, activeColumn.id, index, index + 1);
  }

  if (columns.length === 0) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Sticky header region containing controls and add task */}
      {activeColumn && (
        <div className="flex shrink-0 flex-col">
          <MobileColumnControls
            title={activeColumn.title}
            taskCount={activeColumn.tasks.length}
            currentIndex={safeIndex}
            totalColumns={columns.length}
            canDelete={columns.length > 1}
            canShiftLeft={safeIndex > 0}
            canShiftRight={safeIndex < columns.length - 1}
            onPrev={goToPrev}
            onNext={goToNext}
            onRename={(title) => onRenameColumn(activeColumn.id, title)}
            onShiftLeft={handleShiftLeft}
            onShiftRight={handleShiftRight}
            onDelete={handleDeleteColumn}
            onAddColumn={onAddColumn}
          />

          <div className="mb-3 shrink-0 px-4">
            <AddTask onAdd={(title) => onAddTask(activeColumn.id, title)} />
          </div>
        </div>
      )}

      {/* Task list for the active column */}
      {activeColumn && (
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
          {/* Task cards */}
          <div className="flex flex-col gap-2">
            {activeColumn.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border border-dashed py-12 text-center">
                <p className="font-medium text-sm text-text-muted">
                  No tasks yet
                </p>
                <p className="mt-1 text-text-muted text-xs">
                  Tap &quot;Add task&quot; above to get started
                </p>
              </div>
            ) : (
              activeColumn.tasks.map((task, index) => (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  columns={columns}
                  isFirst={index === 0}
                  isLast={index === activeColumn.tasks.length - 1}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onMoveToColumn={handleMoveTaskToColumn}
                  onMoveUp={handleMoveTaskUp}
                  onMoveDown={handleMoveTaskDown}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
