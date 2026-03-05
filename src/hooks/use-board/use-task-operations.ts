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
  columnsRef: React.RefObject<ColumnWithTasks[]>;
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
  isPersistedRef: React.RefObject<boolean>;
  onMutationRef: React.RefObject<(() => void) | undefined>;
  persistBoard: () => Promise<Board>;
  enqueue: (op: () => Promise<void>) => void;
}

export function useTaskOperations({
  slug,
  supabase,
  columnsRef,
  setColumns,
  isPersistedRef,
  onMutationRef,
  persistBoard,
  enqueue,
}: UseTaskOperationsProps) {
  const addTask = useCallback(
    (columnId: string, title: string, priority: Priority = "medium") => {
      const currentCols = columnsRef.current ?? [];
      const col = currentCols.find((c) => c.id === columnId);
      const position = col ? col.tasks.length : 0;

      // Optimistic: add a temp task immediately
      const tempTask: Task = {
        id: `local-${generateUUID()}`,
        column_id: columnId,
        title,
        description: null,
        priority,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId ? { ...c, tasks: [...c.tasks, tempTask] } : c,
        ),
      );

      enqueue(async () => {
        try {
          // Ensure board exists
          const board = await persistBoard();
          let targetColumnId = columnId;

          // If the target column is still unpersisted local-, create it first
          if (columnId.startsWith("local-")) {
            const currentSnapshot = columnsRef.current ?? [];
            const targetCol = currentSnapshot.find((c) => c.id === columnId);
            if (targetCol) {
              const newCol = await createColumn(supabase, {
                board_id: board.id,
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
          // Rollback task addition
          setColumns((prev) =>
            prev.map((c) => ({
              ...c,
              tasks: c.tasks.filter((t) => t.id !== tempTask.id),
            })),
          );
          showMutationError("add task");
        }
      });
    },
    [columnsRef, setColumns, enqueue, persistBoard, supabase, onMutationRef],
  );

  const editTask = useCallback(
    (
      taskId: string,
      updates: {
        title?: string;
        description?: string | null;
        priority?: Priority;
      },
    ) => {
      const snapshot = columnsRef.current ?? [];
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t,
          ),
        })),
      );

      if (!isPersistedRef.current || taskId.startsWith("local-")) return;

      enqueue(async () => {
        try {
          await updateTask(supabase, slug, { id: taskId, ...updates });
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("update task");
        }
      });
    },
    [
      supabase,
      slug,
      columnsRef,
      setColumns,
      isPersistedRef,
      enqueue,
      onMutationRef,
    ],
  );

  const removeTask = useCallback(
    (taskId: string) => {
      const snapshot = columnsRef.current ?? [];
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks
            .filter((t) => t.id !== taskId)
            .map((t, i) => ({ ...t, position: i })),
        })),
      );

      if (!isPersistedRef.current || taskId.startsWith("local-")) return;

      enqueue(async () => {
        try {
          await dbDeleteTask(supabase, slug, taskId);
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("delete task");
        }
      });
    },
    [
      supabase,
      slug,
      columnsRef,
      setColumns,
      isPersistedRef,
      enqueue,
      onMutationRef,
    ],
  );

  const moveTask = useCallback(
    (
      sourceColId: string,
      destColId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      const currentCols = columnsRef.current ?? [];
      const snapshot = currentCols;

      const newCols = currentCols.map((col) => ({
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

      if (!isPersistedRef.current) return;

      const tasksToUpdate: Task[] = [];
      const affected =
        sourceColId === destColId ? [destCol] : [sourceCol, destCol];
      for (const col of affected) {
        if (col.id.startsWith("local-")) continue;
        for (const task of col.tasks) {
          if (task.id.startsWith("local-")) continue;
          tasksToUpdate.push({
            ...task,
            column_id: col.id,
            position: task.position,
          });
        }
      }

      if (tasksToUpdate.length > 0) {
        enqueue(async () => {
          try {
            await updateTaskPositions(supabase, slug, tasksToUpdate);
            onMutationRef.current?.();
          } catch {
            setColumns(snapshot);
            showMutationError("move task");
          }
        });
      }
    },
    [
      columnsRef,
      setColumns,
      isPersistedRef,
      enqueue,
      supabase,
      slug,
      onMutationRef,
    ],
  );

  return {
    addTask,
    editTask,
    removeTask,
    moveTask,
  };
}
