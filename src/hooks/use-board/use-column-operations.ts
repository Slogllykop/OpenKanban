import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import {
  createColumn,
  deleteColumn as dbDeleteColumn,
  updateColumn,
  updateColumnPositions,
} from "@/lib/db";
import type { Board, Column, ColumnWithTasks } from "@/lib/types";
import { makeLocalColumn, showMutationError } from "./utils";

interface UseColumnOperationsProps {
  slug: string;
  supabase: SupabaseClient;
  columnsRef: React.RefObject<ColumnWithTasks[]>;
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
  isPersistedRef: React.RefObject<boolean>;
  onMutationRef: React.RefObject<(() => void) | undefined>;
  persistBoard: () => Promise<Board>;
  enqueue: (op: () => Promise<void>) => void;
}

export function useColumnOperations({
  slug,
  supabase,
  columnsRef,
  setColumns,
  isPersistedRef,
  onMutationRef,
  persistBoard,
  enqueue,
}: UseColumnOperationsProps) {
  const addColumn = useCallback(
    (title = "Untitled") => {
      const position = columnsRef.current ? columnsRef.current.length : 0;
      const tempCol = makeLocalColumn(title, position);

      // Optimistic UI update
      setColumns((prev) => [...prev, tempCol]);

      // Queue DB operation
      enqueue(async () => {
        try {
          const board = await persistBoard();
          const dbCol = await createColumn(supabase, {
            board_id: board.id,
            title,
            position,
          });

          setColumns((prev) =>
            prev.map((col) =>
              col.id === tempCol.id
                ? { ...dbCol, tasks: [], board_id: board.id }
                : col,
            ),
          );
          onMutationRef.current?.();
        } catch {
          setColumns((prev) => prev.filter((col) => col.id !== tempCol.id));
          showMutationError("add column");
        }
      });
    },
    [columnsRef, setColumns, enqueue, persistBoard, supabase, onMutationRef],
  );

  const renameColumn = useCallback(
    (columnId: string, title: string) => {
      const snapshot = columnsRef.current ?? [];

      // Optimistic UI update
      setColumns((prev) =>
        prev.map((col) => (col.id === columnId ? { ...col, title } : col)),
      );

      if (!isPersistedRef.current || columnId.startsWith("local-")) return;

      enqueue(async () => {
        try {
          await updateColumn(supabase, slug, { id: columnId, title });
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("rename column");
        }
      });
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

  const toggleColumnCollapse = useCallback(
    (columnId: string, is_collapsed: boolean) => {
      const snapshot = columnsRef.current ?? [];

      // Optimistic UI update
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, is_collapsed } : col,
        ),
      );

      if (!isPersistedRef.current || columnId.startsWith("local-")) return;

      enqueue(async () => {
        try {
          await updateColumn(supabase, slug, { id: columnId, is_collapsed });
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("toggle column");
        }
      });
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

  const removeColumn = useCallback(
    (columnId: string) => {
      const currentCols = columnsRef.current ?? [];
      if (currentCols.length <= 1) return;

      const snapshot = currentCols;
      const filtered = currentCols.filter((col) => col.id !== columnId);
      const newCols = filtered.map((col, i) => ({ ...col, position: i }));

      // Optimistic UI update
      setColumns(newCols);

      if (!isPersistedRef.current || columnId.startsWith("local-")) return;

      const colUpdates: Column[] = newCols.map((col) => ({
        id: col.id,
        board_id: col.board_id,
        title: col.title,
        position: col.position,
        is_collapsed: col.is_collapsed,
        created_at: col.created_at,
      }));

      enqueue(async () => {
        try {
          await dbDeleteColumn(supabase, slug, columnId);
          if (colUpdates.length > 0) {
            await updateColumnPositions(supabase, slug, colUpdates);
          }
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("delete column");
        }
      });
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

  const moveColumn = useCallback(
    (sourceIndex: number, destIndex: number) => {
      const currentCols = columnsRef.current ?? [];
      const snapshot = currentCols;

      const newCols = [...currentCols];
      const [moved] = newCols.splice(sourceIndex, 1);
      if (!moved) return;
      newCols.splice(destIndex, 0, moved);
      const result = newCols.map((col, i) => ({ ...col, position: i }));

      // Optimistic UI update
      setColumns(result);

      if (!isPersistedRef.current) return;

      const colUpdates: Column[] = result.map((col) => ({
        id: col.id,
        board_id: col.board_id,
        title: col.title,
        position: col.position,
        is_collapsed: col.is_collapsed,
        created_at: col.created_at,
      }));

      enqueue(async () => {
        try {
          await updateColumnPositions(supabase, slug, colUpdates);
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("move column");
        }
      });
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
    addColumn,
    renameColumn,
    toggleColumnCollapse,
    removeColumn,
    moveColumn,
  };
}
