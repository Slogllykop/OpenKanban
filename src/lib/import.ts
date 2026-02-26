import {
  createBoard,
  createColumn,
  createTask,
  deleteColumn,
  getBoard,
  getColumns,
} from "@/lib/db";
import type { ExportData } from "@/lib/export";
import { createClient } from "@/lib/supabase/client";
import type { Board, ColumnWithTasks, Priority } from "@/lib/types";

/**
 * Import a board from a JSON file.
 * Parses the file, validates the schema, and upserts columns/tasks into the DB.
 * If the board already exists, existing columns/tasks are cleared first.
 */
export async function importBoard(
  file: File,
  slug: string,
): Promise<{ board: Board; columns: ColumnWithTasks[] } | null> {
  const text = await file.text();
  let data: ExportData;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  // Basic validation
  if (data.version !== 1 || !data.board?.columns) {
    throw new Error("Invalid export format");
  }

  const supabase = createClient();

  // Get or create the board
  let board = await getBoard(supabase, slug);

  if (board) {
    // Clear existing columns (cascade deletes tasks)
    const existingCols = await getColumns(supabase, board.id);
    for (const col of existingCols) {
      await deleteColumn(supabase, col.id);
    }
  } else {
    board = await createBoard(supabase, slug);
  }

  // Create columns and tasks from import data
  const columnsWithTasks: ColumnWithTasks[] = [];

  for (const colData of data.board.columns) {
    const col = await createColumn(supabase, {
      board_id: board.id,
      title: colData.title,
      position: colData.position,
    });

    const tasks = [];
    for (const taskData of colData.tasks) {
      const task = await createTask(supabase, {
        column_id: col.id,
        title: taskData.title,
        description: taskData.description ?? undefined,
        priority: (taskData.priority as Priority) ?? "medium",
        position: taskData.position,
      });
      tasks.push(task);
    }

    columnsWithTasks.push({ ...col, tasks });
  }

  return { board, columns: columnsWithTasks };
}
