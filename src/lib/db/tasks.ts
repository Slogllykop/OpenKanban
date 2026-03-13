import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/lib/types";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations";
import { handleSupabaseError } from "./errors";

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

/** Create a new task (slug-scoped — Finding #7) */
export async function createTask(
  supabase: SupabaseClient,
  slug: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  createTaskSchema.parse(payload);

  const response = await supabase
    .rpc("create_task_p", {
      p_slug: slug,
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
  slug: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  updateTaskSchema.parse(payload);

  const { id, ...updates } = payload;
  const response = await supabase
    .rpc("update_task_p", {
      p_slug: slug,
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
  slug: string,
  taskId: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_task_p", {
    p_slug: slug,
    p_id: taskId,
  });
  if (error) handleSupabaseError(error);
}

/** Maximum batch size for position updates (Finding #4) */
const MAX_BATCH_SIZE = 200;

/** Batch update task positions and/or column assignments */
export async function updateTaskPositions(
  supabase: SupabaseClient,
  slug: string,
  updates: Task[],
): Promise<void> {
  if (updates.length === 0) return;

  // Deduplicate by ID to prevent updating the same row twice in one batch
  const uniqueUpdates = Array.from(
    new Map(updates.map((item) => [item.id, item])).values(),
  );

  // Finding #4: Client-side batch size guard
  if (uniqueUpdates.length > MAX_BATCH_SIZE) {
    throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
  }

  const payload = uniqueUpdates.map((task) => ({
    id: task.id,
    column_id: task.column_id,
    position: task.position,
    title: task.title,
    description: task.description,
    priority: task.priority,
  }));

  const { error } = await supabase.rpc("update_task_positions_p", {
    p_slug: slug,
    p_updates: payload,
  });
  if (error) handleSupabaseError(error);
}
