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
  /** Called after every DB write — used to trigger broadcast sync */
  onMutation?: () => void;
}

/** Create a local-only column (not yet persisted to DB) */
function makeLocalColumn(title: string, position: number): ColumnWithTasks {
  return {
    id: `local-${crypto.randomUUID()}`,
    board_id: "",
    title,
    position,
    created_at: new Date().toISOString(),
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
    return [makeLocalColumn("To Do", 0)];
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
        data.columns.length > 0 ? data.columns : [makeLocalColumn("To Do", 0)],
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
        let position = 0;
        setColumns((prev) => {
          position = prev.length;
          return prev;
        });
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
    [supabase],
  );

  const renameColumn = useCallback(
    async (columnId: string, title: string) => {
      setColumns((prev) =>
        prev.map((col) => (col.id === columnId ? { ...col, title } : col)),
      );
      if (isPersistedRef.current) {
        await updateColumn(supabase, { id: columnId, title });
        onMutationRef.current?.();
      }
    },
    [supabase],
  );

  const removeColumn = useCallback(
    async (columnId: string) => {
      let shouldDelete = false;
      setColumns((prev) => {
        if (prev.length <= 1) return prev; // Keep at least 1 column
        shouldDelete = true;
        const filtered = prev.filter((col) => col.id !== columnId);
        return filtered.map((col, i) => ({ ...col, position: i }));
      });
      if (shouldDelete && isPersistedRef.current) {
        await dbDeleteColumn(supabase, columnId);
        onMutationRef.current?.();
      }
    },
    [supabase],
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
          let snapshot: ColumnWithTasks[] = [];
          setColumns((prev) => {
            snapshot = prev;
            return prev;
          });

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
        let position = 0;
        setColumns((prev) => {
          const col = prev.find((c) => c.id === columnId);
          position = col ? col.tasks.length : 0;
          return prev;
        });

        const payload: CreateTaskPayload = {
          column_id: columnId,
          title,
          priority,
          position,
        };
        const newTask = await createTask(supabase, payload);
        setColumns((prev) =>
          prev.map((c) =>
            c.id === columnId ? { ...c, tasks: [...c.tasks, newTask] } : c,
          ),
        );
        onMutationRef.current?.();
      } finally {
        setIsLoading(false);
      }
    },
    [persistBoard, supabase],
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
  // Drag & Drop — compute updates inside setColumns callback (synchronous)
  // -----------------------------------------------------------------------
  const moveTask = useCallback(
    async (
      sourceColId: string,
      destColId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      const tasksToUpdate: Task[] = [];

      setColumns((prev) => {
        const newCols = prev.map((col) => ({
          ...col,
          tasks: [...col.tasks],
        }));

        const sourceCol = newCols.find((c) => c.id === sourceColId);
        const destCol = newCols.find((c) => c.id === destColId);
        if (!sourceCol || !destCol) return prev;

        const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
        if (!movedTask) return prev;

        movedTask.column_id = destColId;
        destCol.tasks.splice(destIndex, 0, movedTask);

        sourceCol.tasks.forEach((t, i) => {
          t.position = i;
        });
        destCol.tasks.forEach((t, i) => {
          t.position = i;
        });

        // Collect affected tasks for DB update
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

        return newCols;
      });

      // setColumns callback ran synchronously — tasksToUpdate is populated
      if (isPersistedRef.current && tasksToUpdate.length > 0) {
        await updateTaskPositions(supabase, tasksToUpdate).catch(console.error);
        onMutationRef.current?.();
      }
    },
    [supabase],
  );

  const moveColumn = useCallback(
    async (sourceIndex: number, destIndex: number) => {
      const colUpdates: Column[] = [];

      setColumns((prev) => {
        const newCols = [...prev];
        const [moved] = newCols.splice(sourceIndex, 1);
        if (!moved) return prev;
        newCols.splice(destIndex, 0, moved);
        const result = newCols.map((col, i) => ({ ...col, position: i }));
        for (const col of result) {
          colUpdates.push({
            id: col.id,
            board_id: col.board_id,
            title: col.title,
            position: col.position,
            created_at: col.created_at,
          });
        }
        return result;
      });

      if (isPersistedRef.current && colUpdates.length > 0) {
        await updateColumnPositions(supabase, colUpdates).catch(console.error);
        onMutationRef.current?.();
      }
    },
    [supabase],
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
    setColumns([makeLocalColumn("To Do", 0)]);
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
        newColumns.length > 0 ? newColumns : [makeLocalColumn("To Do", 0)],
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
