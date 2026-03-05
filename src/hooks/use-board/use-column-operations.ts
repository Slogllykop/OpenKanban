import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import {
  batchToggleColumnsCollapse,
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
          const wasPersisted = isPersistedRef.current;
          const board = await persistBoard();

          // If the board was just created, persist any existing local columns
          // (e.g. the default "To Do" column) before creating the new one
          if (!wasPersisted) {
            const currentSnapshot = columnsRef.current ?? [];
            for (const col of currentSnapshot) {
              if (col.id.startsWith("local-") && col.id !== tempCol.id) {
                const newCol = await createColumn(supabase, {
                  board_id: board.id,
                  title: col.title,
                  position: col.position,
                });
                setColumns((prev) =>
                  prev.map((c) =>
                    c.id === col.id
                      ? { ...c, id: newCol.id, board_id: board.id }
                      : c,
                  ),
                );
              }
            }
          }

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
    [
      columnsRef,
      setColumns,
      enqueue,
      persistBoard,
      supabase,
      onMutationRef,
      isPersistedRef,
    ],
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

  const toggleAllColumnsCollapse = useCallback(
    (is_collapsed: boolean) => {
      const currentCols = columnsRef.current ?? [];

      // Check if all columns are already in the desired state
      const isAlreadyInState = currentCols.every(
        (col) => col.is_collapsed === is_collapsed,
      );
      if (isAlreadyInState) return;

      const snapshot = currentCols;

      // Optimistic UI update
      setColumns((prev) => prev.map((col) => ({ ...col, is_collapsed })));

      if (!isPersistedRef.current) return;

      enqueue(async () => {
        try {
          await batchToggleColumnsCollapse(supabase, slug, is_collapsed);
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError(
            `toggle all columns ${is_collapsed ? "collapse" : "expand"}`,
          );
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
    toggleAllColumnsCollapse,
    removeColumn,
    moveColumn,
  };
}
