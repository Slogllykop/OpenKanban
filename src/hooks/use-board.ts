"use client";

import { useCallback, useRef, useState } from "react";
import {
  createBoard,
  createColumn,
  createTask,
  deleteBoard as dbDeleteBoard,
  deleteColumn as dbDeleteColumn,
  deleteTask as dbDeleteTask,
  getFullBoard,
  updateColumn,
  updateColumnPositions,
  updateTask,
  updateTaskPositions,
} from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import type {
  Board,
  Column,
  ColumnWithTasks,
  CreateTaskPayload,
  Priority,
  Task,
} from "@/lib/types";

interface UseBoardOptions {
  slug: string;
  initialBoard: Board | null;
  initialColumns: ColumnWithTasks[];
  /** Called after every DB write - used to trigger broadcast sync */
  onMutation?: () => void;
}

/** Create a local-only column (not yet persisted to DB) */
function makeLocalColumn(
  title: string,
  position: number,
  id?: string,
): ColumnWithTasks {
  return {
    id: id || `local-${crypto.randomUUID()}`,
    board_id: "",
    title,
    position,
    is_collapsed: false,
    created_at: new Date().toISOString(),
    tasks: [],
  };
}

function getInitialLocalColumn(): ColumnWithTasks {
  return {
    id: "local-initial-todo",
    board_id: "",
    title: "To Do",
    position: 0,
    is_collapsed: false,
    created_at: "2026-01-01T00:00:00.000Z",
    tasks: [],
  };
}

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

  // -----------------------------------------------------------------------
  // Refresh from DB (called when another client broadcasts a sync event)
  // -----------------------------------------------------------------------
  const refreshFromDB = useCallback(async () => {
    const data = await getFullBoard(supabase, slug);
    if (data) {
      boardRef.current = data.board;
      isPersistedRef.current = true;
      setBoard(data.board);
      setColumns(
        data.columns.length > 0 ? data.columns : [getInitialLocalColumn()],
      );
    }
  }, [slug, supabase]);

  // -----------------------------------------------------------------------
  // Persist board + all current columns to DB (called on first task add)
  // -----------------------------------------------------------------------
  const persistBoard = useCallback(
    async (
      currentColumns: ColumnWithTasks[],
    ): Promise<{ board: Board; idMap: Map<string, string> }> => {
      const newBoard = await createBoard(supabase, slug);
      const idMap = new Map<string, string>();

      for (let i = 0; i < currentColumns.length; i++) {
        const col = currentColumns[i];
        const dbCol = await createColumn(supabase, {
          board_id: newBoard.id,
          title: col.title,
          position: i,
        });
        idMap.set(col.id, dbCol.id);
      }

      isPersistedRef.current = true;
      boardRef.current = newBoard;
      setBoard(newBoard);
      return { board: newBoard, idMap };
    },
    [slug, supabase],
  );

  // -----------------------------------------------------------------------
  // Column operations
  // -----------------------------------------------------------------------
  const addColumn = useCallback(
    async (title = "Untitled") => {
      if (!isPersistedRef.current) {
        setColumns((prev) => [...prev, makeLocalColumn(title, prev.length)]);
        return;
      }

      setIsLoading(true);
      try {
        const currentBoard = boardRef.current;
        if (!currentBoard) return;

        const position = columns.length;
        const newCol = await createColumn(supabase, {
          board_id: currentBoard.id,
          title,
          position,
        });
        setColumns((prev) => [...prev, { ...newCol, tasks: [] }]);
        onMutationRef.current?.();
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, columns],
  );

  const renameColumn = useCallback(
    async (columnId: string, title: string) => {
      setColumns((prev) =>
        prev.map((col) => (col.id === columnId ? { ...col, title } : col)),
      );
      if (isPersistedRef.current && !columnId.startsWith("local-")) {
        await updateColumn(supabase, { id: columnId, title });
        onMutationRef.current?.();
      }
    },
    [supabase],
  );

  const toggleColumnCollapse = useCallback(
    async (columnId: string, is_collapsed: boolean) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, is_collapsed } : col,
        ),
      );
      if (isPersistedRef.current && !columnId.startsWith("local-")) {
        await updateColumn(supabase, { id: columnId, is_collapsed });
        onMutationRef.current?.();
      }
    },
    [supabase],
  );

  const removeColumn = useCallback(
    async (columnId: string) => {
      if (columns.length <= 1) return; // Keep at least 1 column

      const filtered = columns.filter((col) => col.id !== columnId);
      const newCols = filtered.map((col, i) => ({ ...col, position: i }));

      const colUpdates: Column[] = newCols.map((col) => ({
        id: col.id,
        board_id: col.board_id,
        title: col.title,
        position: col.position,
        is_collapsed: col.is_collapsed,
        created_at: col.created_at,
      }));

      // Update UI optimistically
      setColumns(newCols);

      if (isPersistedRef.current) {
        try {
          await dbDeleteColumn(supabase, columnId);
          if (colUpdates.length > 0) {
            await updateColumnPositions(supabase, colUpdates).catch(
              console.error,
            );
          }
          onMutationRef.current?.();
        } catch (error) {
          console.error(`[removeColumn] dbDeleteColumn failed!`, error);
        }
      }
    },
    [columns, supabase],
  );

  // -----------------------------------------------------------------------
  // Task operations
  // -----------------------------------------------------------------------
  const addTask = useCallback(
    async (columnId: string, title: string, priority: Priority = "medium") => {
      setIsLoading(true);
      try {
        if (!isPersistedRef.current) {
          // First task triggers full persistence
          const snapshot = columns;
          const { board: newBoard, idMap } = await persistBoard(snapshot);

          const dbColumnId = idMap.get(columnId) ?? columnId;
          const targetCol = snapshot.find((c) => c.id === columnId);
          const position = targetCol ? targetCol.tasks.length : 0;

          const newTask = await createTask(supabase, {
            column_id: dbColumnId,
            title,
            priority,
            position,
          });

          // Replace local IDs with DB IDs and add the task
          setColumns((prev) =>
            prev.map((col) => {
              const newId = idMap.get(col.id) ?? col.id;
              const updated = { ...col, id: newId, board_id: newBoard.id };
              return newId === dbColumnId
                ? { ...updated, tasks: [...col.tasks, newTask] }
                : updated;
            }),
          );
          onMutationRef.current?.();
          return;
        }

        // Normal persisted flow
        let targetColumnId = columnId;

        // Defensive recovery: If board is persisted but this column is somehow still 'local-',
        // it means a previous operation partially failed (or Fast Refresh preserved stale state).
        // Save the column to the database right now.
        if (columnId.startsWith("local-") && isPersistedRef.current) {
          const currentBoard = boardRef.current;
          const targetCol = columns.find((c) => c.id === columnId);
          if (currentBoard && targetCol) {
            const newCol = await createColumn(supabase, {
              board_id: currentBoard.id,
              title: targetCol.title,
              position: targetCol.position,
            });
            targetColumnId = newCol.id;
            // Update state so the column ID is accurate
            setColumns((prev) =>
              prev.map((c) =>
                c.id === columnId ? { ...c, id: newCol.id } : c,
              ),
            );
          }
        }

        const col = columns.find((c) => c.id === columnId);
        const position = col ? col.tasks.length : 0;

        const payload: CreateTaskPayload = {
          column_id: targetColumnId,
          title,
          priority,
          position,
        };
        const newTask = await createTask(supabase, payload);

        setColumns((prev) =>
          prev.map((c) =>
            c.id === columnId || c.id === targetColumnId
              ? { ...c, id: targetColumnId, tasks: [...c.tasks, newTask] }
              : c,
          ),
        );
        onMutationRef.current?.();
      } finally {
        setIsLoading(false);
      }
    },
    [persistBoard, supabase, columns],
  );

  const editTask = useCallback(
    async (
      taskId: string,
      updates: {
        title?: string;
        description?: string | null;
        priority?: Priority;
      },
    ) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t,
          ),
        })),
      );
      await updateTask(supabase, { id: taskId, ...updates });
      onMutationRef.current?.();
    },
    [supabase],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, position: i })),
        })),
      );
      await dbDeleteTask(supabase, taskId);
      onMutationRef.current?.();
    },
    [supabase],
  );

  // -----------------------------------------------------------------------
  // Drag & Drop - compute updates inside setColumns callback (synchronous)
  // -----------------------------------------------------------------------
  const moveTask = useCallback(
    async (
      sourceColId: string,
      destColId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      const newCols = columns.map((col) => ({
        ...col,
        tasks: [...col.tasks],
      }));

      const sourceCol = newCols.find((c) => c.id === sourceColId);
      const destCol = newCols.find((c) => c.id === destColId);
      if (!sourceCol || !destCol) return;

      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
      if (!movedTask) return;

      movedTask.column_id = destColId;
      destCol.tasks.splice(destIndex, 0, movedTask);

      sourceCol.tasks.forEach((t, i) => {
        t.position = i;
      });
      destCol.tasks.forEach((t, i) => {
        t.position = i;
      });

      setColumns(newCols);

      // Collect affected tasks for DB update
      const tasksToUpdate: Task[] = [];
      const affected =
        sourceColId === destColId ? [destCol] : [sourceCol, destCol];
      for (const col of affected) {
        for (const task of col.tasks) {
          tasksToUpdate.push({
            ...task,
            column_id: col.id,
            position: task.position,
          });
        }
      }

      if (isPersistedRef.current && tasksToUpdate.length > 0) {
        await updateTaskPositions(supabase, tasksToUpdate).catch(console.error);
        onMutationRef.current?.();
      }
    },
    [supabase, columns],
  );

  const moveColumn = useCallback(
    async (sourceIndex: number, destIndex: number) => {
      const newCols = [...columns];
      const [moved] = newCols.splice(sourceIndex, 1);
      if (!moved) return;
      newCols.splice(destIndex, 0, moved);
      const result = newCols.map((col, i) => ({ ...col, position: i }));

      const colUpdates: Column[] = result.map((col) => ({
        id: col.id,
        board_id: col.board_id,
        title: col.title,
        position: col.position,
        is_collapsed: col.is_collapsed,
        created_at: col.created_at,
      }));

      setColumns(result);

      if (isPersistedRef.current && colUpdates.length > 0) {
        await updateColumnPositions(supabase, colUpdates).catch(console.error);
        onMutationRef.current?.();
      }
    },
    [supabase, columns],
  );

  // -----------------------------------------------------------------------
  // Board delete
  // -----------------------------------------------------------------------
  const removeBoard = useCallback(async () => {
    if (boardRef.current && isPersistedRef.current) {
      await dbDeleteBoard(supabase, boardRef.current.id);
    }
    boardRef.current = null;
    isPersistedRef.current = false;
    setBoard(null);
    setColumns([getInitialLocalColumn()]);
  }, [supabase]);

  // -----------------------------------------------------------------------
  // State setter (for realtime updates from other clients)
  // -----------------------------------------------------------------------
  const replaceState = useCallback(
    (newBoard: Board | null, newColumns: ColumnWithTasks[]) => {
      boardRef.current = newBoard;
      isPersistedRef.current = newBoard !== null;
      setBoard(newBoard);
      setColumns(
        newColumns.length > 0 ? newColumns : [getInitialLocalColumn()],
      );
    },
    [],
  );

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
