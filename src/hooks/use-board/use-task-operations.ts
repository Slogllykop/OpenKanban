import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import {
  createColumn,
  createTask,
  deleteTask as dbDeleteTask,
  updateTask,
  updateTaskPositions,
} from "@/lib/db";
import type {
  Board,
  ColumnWithTasks,
  CreateTaskPayload,
  Priority,
  Task,
} from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { showMutationError } from "./utils";

interface UseTaskOperationsProps {
  slug: string;
  supabase: SupabaseClient;
  columns: ColumnWithTasks[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
  boardRef: React.RefObject<Board | null>;
  isPersistedRef: React.RefObject<boolean>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onMutationRef: React.RefObject<(() => void) | undefined>;
  persistBoard: (
    currentColumns: ColumnWithTasks[],
  ) => Promise<{ board: Board; idMap: Map<string, string> }>;
}

export function useTaskOperations({
  slug,
  supabase,
  columns,
  setColumns,
  boardRef,
  isPersistedRef,
  setIsLoading,
  onMutationRef,
  persistBoard,
}: UseTaskOperationsProps) {
  const addTask = useCallback(
    async (columnId: string, title: string, priority: Priority = "medium") => {
      const snapshot = columns;
      try {
        if (!isPersistedRef.current) {
          setIsLoading(true);
          // First task triggers full persistence
          const currentSnapshot = columns;
          const { board: newBoard, idMap } =
            await persistBoard(currentSnapshot);

          const dbColumnId = idMap.get(columnId) ?? columnId;
          const targetCol = currentSnapshot.find((c) => c.id === columnId);
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
          setIsLoading(false);
          return;
        }

        // Normal persisted flow
        let targetColumnId = columnId;

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
            setColumns((prev) =>
              prev.map((c) =>
                c.id === columnId ? { ...c, id: newCol.id } : c,
              ),
            );
          }
        }

        const col = columns.find((c) => c.id === columnId);
        const position = col ? col.tasks.length : 0;

        // Optimistic: add a temp task immediately
        const tempTask: Task = {
          id: `local-${generateUUID()}`,
          column_id: targetColumnId,
          title,
          description: null,
          priority,
          position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setColumns((prev) =>
          prev.map((c) =>
            c.id === columnId || c.id === targetColumnId
              ? { ...c, id: targetColumnId, tasks: [...c.tasks, tempTask] }
              : c,
          ),
        );

        // Persist in background, then reconcile
        const payload: CreateTaskPayload = {
          column_id: targetColumnId,
          title,
          priority,
          position,
        };
        const dbTask = await createTask(supabase, payload);

        setColumns((prev) =>
          prev.map((c) => ({
            ...c,
            tasks: c.tasks.map((t) => (t.id === tempTask.id ? dbTask : t)),
          })),
        );
        onMutationRef.current?.();
      } catch {
        setColumns(snapshot);
        showMutationError("add task");
      } finally {
        setIsLoading(false);
      }
    },
    [
      persistBoard,
      supabase,
      columns,
      isPersistedRef,
      setIsLoading,
      setColumns,
      onMutationRef,
      boardRef,
    ],
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
      const snapshot = columns;
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t,
          ),
        })),
      );
      try {
        await updateTask(supabase, slug, { id: taskId, ...updates });
        onMutationRef.current?.();
      } catch {
        setColumns(snapshot);
        showMutationError("update task");
      }
    },
    [supabase, slug, columns, setColumns, onMutationRef],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      const snapshot = columns;
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, position: i })),
        })),
      );
      try {
        await dbDeleteTask(supabase, slug, taskId);
        onMutationRef.current?.();
      } catch {
        setColumns(snapshot);
        showMutationError("delete task");
      }
    },
    [supabase, slug, columns, setColumns, onMutationRef],
  );

  const moveTask = useCallback(
    async (
      sourceColId: string,
      destColId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      const snapshot = columns;

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
        try {
          await updateTaskPositions(supabase, slug, tasksToUpdate);
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("move task");
        }
      }
    },
    [supabase, slug, columns, setColumns, isPersistedRef, onMutationRef],
  );

  return {
    addTask,
    editTask,
    removeTask,
    moveTask,
  };
}
