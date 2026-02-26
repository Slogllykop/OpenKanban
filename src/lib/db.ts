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
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) handleSupabaseError(error);
  return data;
}

/** Create a new board with the given slug */
export async function createBoard(
  supabase: SupabaseClient,
  slug: string,
): Promise<Board> {
  const { data, error } = await supabase
    .from("boards")
    .insert({ slug })
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

/** Delete a board and all its columns/tasks (cascade) */
export async function deleteBoard(
  supabase: SupabaseClient,
  boardId: string,
): Promise<void> {
  const { error } = await supabase.from("boards").delete().eq("id", boardId);
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
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (error) handleSupabaseError(error);
  return data ?? [];
}

/** Create a new column */
export async function createColumn(
  supabase: SupabaseClient,
  payload: CreateColumnPayload,
): Promise<Column> {
  const { data, error } = await supabase
    .from("columns")
    .insert(payload)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

/** Update a column (title, position) */
export async function updateColumn(
  supabase: SupabaseClient,
  payload: UpdateColumnPayload,
): Promise<Column> {
  const { id, ...updates } = payload;
  const { data, error } = await supabase
    .from("columns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

/** Delete a column (cascades to tasks) */
export async function deleteColumn(
  supabase: SupabaseClient,
  columnId: string,
): Promise<void> {
  const { error } = await supabase.from("columns").delete().eq("id", columnId);
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

  const { error } = await supabase
    .from("columns")
    .upsert(uniqueUpdates, { onConflict: "id" });
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
  const { data, error } = await supabase
    .from("tasks")
    .select("*, columns!inner(board_id)")
    .eq("columns.board_id", boardId)
    .order("position", { ascending: true });

  if (error) handleSupabaseError(error);

  // Strip the joined columns data, return flat tasks
  return (data ?? []).map(({ columns: _, ...task }) => task as Task);
}

/** Create a new task */
export async function createTask(
  supabase: SupabaseClient,
  payload: CreateTaskPayload,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

/** Update a task (title, description, priority, column_id, position) */
export async function updateTask(
  supabase: SupabaseClient,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { id, ...updates } = payload;
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data;
}

/** Delete a task */
export async function deleteTask(
  supabase: SupabaseClient,
  taskId: string,
): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) handleSupabaseError(error);
}

/** Batch update task positions and/or column assignments */
export async function updateTaskPositions(
  supabase: SupabaseClient,
  updates: Task[],
): Promise<void> {
  if (updates.length === 0) return;

  // Deduplicate by ID to prevent "ON CONFLICT DO UPDATE command cannot affect row a second time" error
  const uniqueUpdates = Array.from(
    new Map(updates.map((item) => [item.id, item])).values(),
  );

  // Supabase upsert needs to know what the primary key is if it differs or if we are just updating
  // We specify `onConflict: 'id'` because without it, Postgres might try to insert duplicates or get confused by other constraints
  const { error } = await supabase
    .from("tasks")
    .upsert(uniqueUpdates, { onConflict: "id" });
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
  const board = await getBoard(supabase, slug);
  if (!board) return null;

  const [columns, tasks] = await Promise.all([
    getColumns(supabase, board.id),
    getTasksByBoard(supabase, board.id),
  ]);

  // Group tasks by column_id
  const tasksByColumn = new Map<string, Task[]>();
  for (const task of tasks) {
    const existing = tasksByColumn.get(task.column_id) ?? [];
    existing.push(task);
    tasksByColumn.set(task.column_id, existing);
  }

  const columnsWithTasks: ColumnWithTasks[] = columns.map((col) => ({
    ...col,
    tasks: tasksByColumn.get(col.id) ?? [],
  }));

  return { board, columns: columnsWithTasks };
}
