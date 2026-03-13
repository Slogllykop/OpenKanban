import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Column,
  CreateColumnPayload,
  UpdateColumnPayload,
} from "@/lib/types";
import { createColumnSchema, updateColumnSchema } from "@/lib/validations";
import { handleSupabaseError } from "./errors";

/** Fetch all columns for a board, ordered by position */
export async function getColumns(
  supabase: SupabaseClient,
  boardId: string,
): Promise<Column[]> {
  const response = await supabase.rpc("get_columns_p", {
    p_board_id: boardId,
  });

  if (response.error) handleSupabaseError(response.error);
  return (response.data as Column[]) ?? [];
}

/** Create a new column (slug-scoped — Finding #7) */
export async function createColumn(
  supabase: SupabaseClient,
  slug: string,
  payload: CreateColumnPayload,
): Promise<Column> {
  createColumnSchema.parse(payload);

  const response = await supabase
    .rpc("create_column_p", {
      p_slug: slug,
      p_board_id: payload.board_id,
      p_title: payload.title,
      p_position: payload.position,
    })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Column;
}

/** Update a column (title, position, is_collapsed) */
export async function updateColumn(
  supabase: SupabaseClient,
  slug: string,
  payload: UpdateColumnPayload,
): Promise<Column> {
  updateColumnSchema.parse(payload);

  const { id, ...updates } = payload;
  const response = await supabase
    .rpc("update_column_p", {
      p_slug: slug,
      p_id: id,
      p_title: updates.title ?? null,
      p_position: updates.position ?? null,
      p_is_collapsed: updates.is_collapsed ?? null,
    })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Column;
}

/** Delete a column (cascades to tasks) */
export async function deleteColumn(
  supabase: SupabaseClient,
  slug: string,
  columnId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_column_p", {
    p_slug: slug,
    p_id: columnId,
  });
  if (error) handleSupabaseError(error);
}

/** Maximum batch size for position updates (Finding #4) */
const MAX_BATCH_SIZE = 200;

/** Batch update column positions */
export async function updateColumnPositions(
  supabase: SupabaseClient,
  slug: string,
  updates: Column[],
): Promise<void> {
  if (updates.length === 0) return;

  const uniqueUpdates = Array.from(
    new Map(updates.map((item) => [item.id, item])).values(),
  );

  // Finding #4: Client-side batch size guard
  if (uniqueUpdates.length > MAX_BATCH_SIZE) {
    throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
  }

  const payload = uniqueUpdates.map((col) => ({
    id: col.id,
    position: col.position,
    title: col.title,
    is_collapsed: col.is_collapsed,
  }));

  const { error } = await supabase.rpc("update_column_positions_p", {
    p_slug: slug,
    p_updates: payload,
  });
  if (error) handleSupabaseError(error);
}

/** Batch toggle the collapse state of all columns for a board */
export async function batchToggleColumnsCollapse(
  supabase: SupabaseClient,
  slug: string,
  isCollapsed: boolean,
): Promise<void> {
  const { error } = await supabase.rpc("batch_toggle_columns_collapse_p", {
    p_slug: slug,
    p_is_collapsed: isCollapsed,
  });

  if (error) handleSupabaseError(error);
}
