import type { SupabaseClient } from "@supabase/supabase-js";
import type { Board, ColumnWithTasks } from "@/lib/types";
import { createBoardSchema } from "@/lib/validations";
import { handleSupabaseError } from "./errors";

/** Fetch a board by slug, returns null if not found */
export async function getBoard(
  supabase: SupabaseClient,
  slug: string,
): Promise<Board | null> {
  const response = await supabase
    .rpc("get_board_p", { p_slug: slug })
    .maybeSingle();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Board | null;
}

/** Create a new board with the given slug */
export async function createBoard(
  supabase: SupabaseClient,
  slug: string,
): Promise<Board> {
  createBoardSchema.parse({ slug });

  const response = await supabase
    .rpc("create_board_p", { p_slug: slug })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Board;
}

/** Delete a board and all its columns/tasks (cascade) */
export async function deleteBoard(
  supabase: SupabaseClient,
  slug: string,
  boardId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_board_p", {
    p_slug: slug,
    p_id: boardId,
  });
  if (error) handleSupabaseError(error);
}

/** Fetch the complete board state: board + columns with nested tasks */
export async function getFullBoard(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ board: Board; columns: ColumnWithTasks[] } | null> {
  const response = await supabase
    .rpc("get_full_board_p", { p_slug: slug })
    .maybeSingle();

  if (response.error) handleSupabaseError(response.error);
  return response.data as { board: Board; columns: ColumnWithTasks[] } | null;
}
