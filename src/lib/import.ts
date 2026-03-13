import { z } from "zod/v4";
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
import {
  columnTitleSchema,
  prioritySchema,
  taskDescriptionSchema,
  taskTitleSchema,
} from "@/lib/validations";

// ---------------------------------------------------------------------------
// Import file validation (Finding #3)
// ---------------------------------------------------------------------------

/** Maximum import file size: 2 MB */
const MAX_IMPORT_SIZE = 2 * 1024 * 1024;

/** Maximum columns per board import */
const MAX_COLUMNS = 50;

/** Maximum tasks per column import */
const MAX_TASKS_PER_COLUMN = 500;

const importTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema.or(z.null()),
  priority: prioritySchema,
  position: z.number().int().nonnegative(),
});

const importColumnSchema = z.object({
  title: columnTitleSchema,
  position: z.number().int().nonnegative(),
  tasks: z.array(importTaskSchema).max(MAX_TASKS_PER_COLUMN),
});

const importFileSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  board: z.object({
    slug: z.string(),
    columns: z.array(importColumnSchema).max(MAX_COLUMNS),
  }),
});

/**
 * Import a board from a JSON file.
 * Validates file size, parses JSON, validates schema with Zod,
 * and upserts columns/tasks into the DB.
 * If the board already exists, existing columns/tasks are cleared first.
 */
export async function importBoard(
  file: File,
  slug: string,
): Promise<{ board: Board; columns: ColumnWithTasks[] } | null> {
  // Finding #3: File size check before reading content
  if (file.size > MAX_IMPORT_SIZE) {
    throw new Error(
      `Import file too large (max ${MAX_IMPORT_SIZE / 1024 / 1024}MB)`,
    );
  }

  const text = await file.text();
  let rawData: unknown;

  try {
    rawData = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  // Finding #3: Full Zod schema validation with length caps
  let data: ExportData;
  try {
    data = importFileSchema.parse(rawData) as ExportData;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid export format: ${err.issues[0]?.message}`);
    }
    throw new Error("Invalid export format");
  }

  const supabase = createClient();

  // Get or create the board
  let board = await getBoard(supabase, slug);

  if (board) {
    // Clear existing columns (cascade deletes tasks)
    const existingCols = await getColumns(supabase, board.id);
    for (const col of existingCols) {
      await deleteColumn(supabase, slug, col.id);
    }
  } else {
    board = await createBoard(supabase, slug);
  }

  // Create columns and tasks from import data
  const columnsWithTasks: ColumnWithTasks[] = [];

  for (const colData of data.board.columns) {
    const col = await createColumn(supabase, slug, {
      board_id: board.id,
      title: colData.title,
      position: colData.position,
    });

    const tasks = [];
    for (const taskData of colData.tasks) {
      const task = await createTask(supabase, slug, {
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
