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

export function useColumnOperations({
  slug,
  supabase,
  columns,
  setColumns,
  boardRef,
  isPersistedRef,
  setIsLoading,
  onMutationRef,
  persistBoard,
}: UseColumnOperationsProps) {
  const addColumn = useCallback(
    async (title = "Untitled") => {
      const snapshot = columns;
      try {
        if (!isPersistedRef.current) {
          setIsLoading(true);
          const newLocalCol = makeLocalColumn(title, columns.length);
          const currentSnapshot = [...columns, newLocalCol];
          const { board: newBoard, idMap } =
            await persistBoard(currentSnapshot);

          setColumns(
            currentSnapshot.map((col) => {
              const newId = idMap.get(col.id) ?? col.id;
              return { ...col, id: newId, board_id: newBoard.id };
            }),
          );
          onMutationRef.current?.();
          setIsLoading(false);
          return;
        }

        const currentBoard = boardRef.current;
        if (!currentBoard) return;

        // Optimistic: add a temp column immediately
        const position = columns.length;
        const tempCol = makeLocalColumn(title, position);
        setColumns((prev) => [...prev, tempCol]);

        // Persist in background, then reconcile
        const dbCol = await createColumn(supabase, {
          board_id: currentBoard.id,
          title,
          position,
        });
        setColumns((prev) =>
          prev.map((col) =>
            col.id === tempCol.id
              ? { ...dbCol, tasks: [], board_id: currentBoard.id }
              : col,
          ),
        );
        onMutationRef.current?.();
      } catch {
        setColumns(snapshot);
        showMutationError("add column");
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

  const renameColumn = useCallback(
    async (columnId: string, title: string) => {
      const snapshot = columns;
      try {
        if (!isPersistedRef.current) {
          setIsLoading(true);
          const currentSnapshot = columns.map((col) =>
            col.id === columnId ? { ...col, title } : col,
          );

          const { board: newBoard, idMap } =
            await persistBoard(currentSnapshot);

          setColumns(
            currentSnapshot.map((col) => {
              const newId = idMap.get(col.id) ?? col.id;
              return { ...col, id: newId, board_id: newBoard.id };
            }),
          );
          onMutationRef.current?.();
          return;
        }

        setColumns((prev) =>
          prev.map((col) => (col.id === columnId ? { ...col, title } : col)),
        );
        if (isPersistedRef.current && !columnId.startsWith("local-")) {
          await updateColumn(supabase, slug, { id: columnId, title });
          onMutationRef.current?.();
        }
      } catch {
        setColumns(snapshot);
        showMutationError("rename column");
      } finally {
        setIsLoading(false);
      }
    },
    [
      persistBoard,
      supabase,
      slug,
      columns,
      isPersistedRef,
      setIsLoading,
      setColumns,
      onMutationRef,
    ],
  );

  const toggleColumnCollapse = useCallback(
    async (columnId: string, is_collapsed: boolean) => {
      const snapshot = columns;
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, is_collapsed } : col,
        ),
      );
      if (isPersistedRef.current && !columnId.startsWith("local-")) {
        try {
          await updateColumn(supabase, slug, { id: columnId, is_collapsed });
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("toggle column");
        }
      }
    },
    [supabase, slug, columns, setColumns, isPersistedRef, onMutationRef],
  );

  const removeColumn = useCallback(
    async (columnId: string) => {
      if (columns.length <= 1) return; // Keep at least 1 column

      const snapshot = columns;

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
          await dbDeleteColumn(supabase, slug, columnId);
          if (colUpdates.length > 0) {
            await updateColumnPositions(supabase, slug, colUpdates);
          }
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("delete column");
        }
      }
    },
    [columns, supabase, slug, setColumns, isPersistedRef, onMutationRef],
  );

  const moveColumn = useCallback(
    async (sourceIndex: number, destIndex: number) => {
      const snapshot = columns;

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
        try {
          await updateColumnPositions(supabase, slug, colUpdates);
          onMutationRef.current?.();
        } catch {
          setColumns(snapshot);
          showMutationError("move column");
        }
      }
    },
    [supabase, slug, columns, setColumns, isPersistedRef, onMutationRef],
  );

  return {
    addColumn,
    renameColumn,
    toggleColumnCollapse,
    removeColumn,
    moveColumn,
  };
}
