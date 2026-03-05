import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback } from "react";
import {
  createBoard,
  deleteBoard as dbDeleteBoard,
  getFullBoard,
} from "@/lib/db";
import type { Board, ColumnWithTasks } from "@/lib/types";
import { getInitialLocalColumn, showMutationError } from "./utils";

interface UseBoardSyncProps {
  slug: string;
  supabase: SupabaseClient;
  boardRef: React.RefObject<Board | null>;
  isPersistedRef: React.RefObject<boolean>;
  setBoard: React.Dispatch<React.SetStateAction<Board | null>>;
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithTasks[]>>;
}

export function useBoardSync({
  slug,
  supabase,
  boardRef,
  isPersistedRef,
  setBoard,
  setColumns,
}: UseBoardSyncProps) {
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
  }, [slug, supabase, boardRef, isPersistedRef, setBoard, setColumns]);

  const persistBoard = useCallback(async (): Promise<Board> => {
    if (boardRef.current) return boardRef.current;

    const newBoard = await createBoard(supabase, slug);
    isPersistedRef.current = true;
    boardRef.current = newBoard;
    setBoard(newBoard);
    return newBoard;
  }, [slug, supabase, boardRef, isPersistedRef, setBoard]);

  const removeBoard = useCallback(async () => {
    if (boardRef.current && isPersistedRef.current) {
      try {
        await dbDeleteBoard(supabase, slug, boardRef.current.id);
      } catch {
        showMutationError("delete board");
        return;
      }
    }
    boardRef.current = null;
    isPersistedRef.current = false;
    setBoard(null);
    setColumns([getInitialLocalColumn()]);
  }, [supabase, slug, boardRef, isPersistedRef, setBoard, setColumns]);

  const replaceState = useCallback(
    (newBoard: Board | null, newColumns: ColumnWithTasks[]) => {
      boardRef.current = newBoard;
      isPersistedRef.current = newBoard !== null;
      setBoard(newBoard);
      setColumns(
        newColumns.length > 0 ? newColumns : [getInitialLocalColumn()],
      );
    },
    [boardRef, isPersistedRef, setBoard, setColumns],
  );

  return {
    refreshFromDB,
    persistBoard,
    removeBoard,
    replaceState,
  };
}
