"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Board, ColumnWithTasks } from "@/lib/types";

import type { UseBoardOptions } from "./use-board/types";
import { useBoardSync } from "./use-board/use-board-sync";
import { useColumnOperations } from "./use-board/use-column-operations";
import { useTaskOperations } from "./use-board/use-task-operations";
import { getInitialLocalColumn } from "./use-board/utils";

export function useBoard({
  slug,
  initialBoard,
  initialColumns,
  onMutation,
}: UseBoardOptions) {
  const [board, setBoard] = useState<Board | null>(initialBoard);
  const [columns, setColumns] = useState<ColumnWithTasks[]>(() => {
    if (initialColumns.length > 0) return initialColumns;
    return [getInitialLocalColumn()];
  });
  const [isLoading, setIsLoading] = useState(false);

  /** Whether board + columns have been persisted to DB */
  const isPersistedRef = useRef(initialBoard !== null);
  /** Store the board object for use across async calls */
  const boardRef = useRef<Board | null>(initialBoard);
  /** Ref to latest onMutation callback (avoids stale closures) */
  const onMutationRef = useRef(onMutation);
  onMutationRef.current = onMutation;

  const supabase = createClient();

  const { refreshFromDB, persistBoard, removeBoard, replaceState } =
    useBoardSync({
      slug,
      supabase,
      boardRef,
      isPersistedRef,
      setBoard,
      setColumns,
    });

  const {
    addColumn,
    renameColumn,
    toggleColumnCollapse,
    removeColumn,
    moveColumn,
  } = useColumnOperations({
    slug,
    supabase,
    columns,
    setColumns,
    boardRef,
    isPersistedRef,
    setIsLoading,
    onMutationRef,
    persistBoard,
  });

  const { addTask, editTask, removeTask, moveTask } = useTaskOperations({
    slug,
    supabase,
    columns,
    setColumns,
    boardRef,
    isPersistedRef,
    setIsLoading,
    onMutationRef,
    persistBoard,
  });

  return {
    board,
    columns,
    isLoading,
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
    replaceState,
    refreshFromDB,
  };
}
