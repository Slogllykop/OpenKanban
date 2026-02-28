import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Board,
  Column,
  ColumnWithTasks,
  CreateColumnPayload,
  CreateTaskPayload,
  Task,
  UpdateColumnPayload,
  UpdateTaskPayload,
} from "@/lib/types";

/** Helper to throw proper Error objects from Supabase errors */
function handleSupabaseError(error: unknown): never {
  if (error && typeof error === "object" && "message" in error) {
    const err = error as Record<string, unknown>;
    throw new Error(
      `Supabase Error: ${String(err.message)}${err.code ? ` (Code: ${String(err.code)})` : ""}${
        err.details ? ` Details: ${String(err.details)}` : ""
      }${err.hint ? ` Hint: ${String(err.hint)}` : ""}`,
    );
  }
  throw new Error(String(error));
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

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
  const response = await supabase
    .rpc("create_board_p", { p_slug: slug })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Board;
}

/** Delete a board and all its columns/tasks (cascade) */
export async function deleteBoard(
  supabase: SupabaseClient,
  boardId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_board_p", { p_id: boardId });
  if (error) handleSupabaseError(error);
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

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

/** Create a new column */
export async function createColumn(
  supabase: SupabaseClient,
  payload: CreateColumnPayload,
): Promise<Column> {
  const response = await supabase
    .rpc("create_column_p", {
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
  payload: UpdateColumnPayload,
): Promise<Column> {
  const { id, ...updates } = payload;
  const response = await supabase
    .rpc("update_column_p", {
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
  columnId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_column_p", { p_id: columnId });
  if (error) handleSupabaseError(error);
}

/** Batch update column positions */
export async function updateColumnPositions(
  supabase: SupabaseClient,
  updates: Column[],
): Promise<void> {
  if (updates.length === 0) return;

  const uniqueUpdates = Array.from(
    new Map(updates.map((item) => [item.id, item])).values(),
  );

  const payload = uniqueUpdates.map((col) => ({
    id: col.id,
    position: col.position,
    title: col.title,
    is_collapsed: col.is_collapsed,
  }));

  const { error } = await supabase.rpc("update_column_positions_p", {
    p_updates: payload,
  });
  if (error) handleSupabaseError(error);
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

/** Fetch all tasks for a board (via its columns), ordered by position */
export async function getTasksByBoard(
  supabase: SupabaseClient,
  boardId: string,
): Promise<Task[]> {
  const response = await supabase.rpc("get_tasks_by_board_p", {
    p_board_id: boardId,
  });

  if (response.error) handleSupabaseError(response.error);
  return (response.data as Task[]) ?? [];
}

/** Create a new task */
export async function createTask(
  supabase: SupabaseClient,
  payload: CreateTaskPayload,
): Promise<Task> {
  const response = await supabase
    .rpc("create_task_p", {
      p_column_id: payload.column_id,
      p_title: payload.title,
      p_description: payload.description ?? null,
      p_priority: payload.priority ?? "medium",
      p_position: payload.position,
    })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Task;
}

/** Update a task (title, description, priority, column_id, position) */
export async function updateTask(
  supabase: SupabaseClient,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { id, ...updates } = payload;
  const response = await supabase
    .rpc("update_task_p", {
      p_id: id,
      p_title: updates.title ?? null,
      p_description: updates.description ?? null,
      p_priority: updates.priority ?? null,
      p_column_id: updates.column_id ?? null,
      p_position: updates.position ?? null,
    })
    .single();

  if (response.error) handleSupabaseError(response.error);
  return response.data as Task;
}

/** Delete a task */
export async function deleteTask(
  supabase: SupabaseClient,
  taskId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_task_p", { p_id: taskId });
  if (error) handleSupabaseError(error);
}

/** Batch update task positions and/or column assignments */
export async function updateTaskPositions(
  supabase: SupabaseClient,
  updates: Task[],
): Promise<void> {
  if (updates.length === 0) return;

  // Deduplicate by ID to prevent updating the same row twice in one batch
  const uniqueUpdates = Array.from(
    new Map(updates.map((item) => [item.id, item])).values(),
  );

  const payload = uniqueUpdates.map((task) => ({
    id: task.id,
    column_id: task.column_id,
    position: task.position,
    title: task.title,
    description: task.description,
    priority: task.priority,
  }));

  const { error } = await supabase.rpc("update_task_positions_p", {
    p_updates: payload,
  });
  if (error) handleSupabaseError(error);
}

// ---------------------------------------------------------------------------
// Full Board Fetch (columns + tasks combined)
// ---------------------------------------------------------------------------

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
