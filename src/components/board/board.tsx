"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { AddColumn } from "@/components/board/add-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { Column } from "@/components/board/column";
import { MobileBoard } from "@/components/board/mobile-board";
import { TaskModal } from "@/components/board/task-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useBoard } from "@/hooks/use-board";
import { useDevice } from "@/hooks/use-device";
import { usePresence } from "@/hooks/use-presence";
import { useRealtime } from "@/hooks/use-realtime";
import { exportBoard } from "@/lib/export";
import { importBoard } from "@/lib/import";
import type { Board as BoardType, ColumnWithTasks, Task } from "@/lib/types";

interface BoardProps {
  slug: string;
  initialBoard: BoardType | null;
  initialColumns: ColumnWithTasks[];
}

export function Board({ slug, initialBoard, initialColumns }: BoardProps) {
  const router = useRouter();
  const { isMobile, isReady } = useDevice();

  // Ref to hold refreshFromDB - avoids circular dependency between hooks
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Realtime: broadcast sync after every mutation, refetch on incoming sync
  const { broadcastSync } = useRealtime({
    slug,
    onSync: () => {
      refreshRef.current?.();
    },
  });

  const {
    columns,
    addColumn,
    renameColumn,
    toggleColumnCollapse,
    removeColumn,
    addTask,
    editTask,
    removeTask,
    moveTask,
    moveColumn,
    removeBoard,
    refreshFromDB,
  } = useBoard({
    slug,
    initialBoard,
    initialColumns,
    onMutation: broadcastSync,
  });

  // Wire the ref after useBoard returns
  refreshRef.current = refreshFromDB;

  // Presence
  const { viewerCount } = usePresence(slug);

  // Task modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete board confirmation
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  // Delete column confirmation
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);

  // Drag & drop handler (desktop only)
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      moveTask(
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index,
      );
    },
    [moveTask],
  );

  // Board delete handler
  async function handleDeleteBoard() {
    setIsDeletingBoard(true);
    try {
      await removeBoard();
      router.push("/");
    } finally {
      setIsDeletingBoard(false);
      setShowDeleteBoard(false);
    }
  }

  // Column delete handler
  async function handleDeleteColumn() {
    if (!deletingColumnId) return;
    await removeColumn(deletingColumnId);
    setDeletingColumnId(null);
  }

  // Export handler
  function handleExport() {
    exportBoard(slug, columns);
  }

  // Import handler
  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        await importBoard(file, slug);
        await refreshFromDB();
        broadcastSync();
      } catch (err) {
        console.error("Import failed:", err);
      }
    };
    input.click();
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-base">
      <BoardToolbar
        slug={slug}
        viewerCount={viewerCount}
        onDeleteBoard={() => setShowDeleteBoard(true)}
        onExport={handleExport}
        onImport={handleImport}
      />

      {!isReady ? (
        /* ── Loading: device detection in progress ── */
        <div className="flex flex-1 items-center justify-center">
          <div className="board-spinner" />
        </div>
      ) : isMobile ? (
        /* ── Mobile: single-column view ── */
        <MobileBoard
          columns={columns}
          onAddColumn={() => addColumn()}
          onRenameColumn={renameColumn}
          onShiftColumn={moveColumn}
          onAddTask={addTask}
          onEditTask={(task) => setEditingTask(task)}
          onDeleteTask={removeTask}
          onMoveTask={moveTask}
          onRequestDeleteColumn={(colId) => setDeletingColumnId(colId)}
        />
      ) : (
        /* ── Desktop: horizontal scrolling multi-column view ── */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board-scroll flex flex-1 gap-4 overflow-x-auto p-4 md:p-6">
            {columns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                canDelete={columns.length > 1}
                canShiftLeft={index > 0}
                canShiftRight={index < columns.length - 1}
                onRenameColumn={renameColumn}
                onToggleCollapse={toggleColumnCollapse}
                onDeleteColumn={(colId) => setDeletingColumnId(colId)}
                onShiftLeft={() => moveColumn(index, index - 1)}
                onShiftRight={() => moveColumn(index, index + 1)}
                onAddTask={addTask}
                onEditTask={(task) => setEditingTask(task)}
                onDeleteTask={removeTask}
              />
            ))}
            <AddColumn onAdd={() => addColumn()} />
          </div>
        </DragDropContext>
      )}

      {/* Task edit modal */}
      <TaskModal
        task={editingTask}
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={editTask}
        onDelete={(taskId) => {
          removeTask(taskId);
          setEditingTask(null);
        }}
      />

      {/* Delete board confirmation */}
      <ConfirmDialog
        open={showDeleteBoard}
        onClose={() => setShowDeleteBoard(false)}
        onConfirm={handleDeleteBoard}
        title="Delete Board"
        description={`Are you sure you want to delete the board "/${slug}"? This will permanently remove all columns and tasks. This action cannot be undone.`}
        confirmLabel="Delete Board"
        loading={isDeletingBoard}
      />

      {/* Delete column confirmation */}
      <ConfirmDialog
        open={deletingColumnId !== null}
        onClose={() => setDeletingColumnId(null)}
        onConfirm={handleDeleteColumn}
        title="Delete Column"
        description="Are you sure you want to delete this column? All tasks in this column will be permanently removed."
        confirmLabel="Delete Column"
      />
    </div>
  );
}
