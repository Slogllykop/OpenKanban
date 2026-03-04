import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug may only contain lowercase letters, numbers, and dashes",
  );

export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const titleSchema = (label: string, max: number) =>
  z
    .string()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const columnTitleSchema = titleSchema("Column title", 100);
export const taskTitleSchema = titleSchema("Task title", 200);
export const taskDescriptionSchema = z
  .string()
  .max(2000, "Description must be 2000 characters or fewer")
  .nullable()
  .optional();

// ---------------------------------------------------------------------------
// Payload schemas
// ---------------------------------------------------------------------------

export const createBoardSchema = z.object({ slug: slugSchema });

export const createColumnSchema = z.object({
  board_id: z.string().uuid(),
  title: columnTitleSchema,
  position: z.number().int().nonnegative(),
});

export const updateColumnSchema = z.object({
  id: z.string().uuid(),
  title: columnTitleSchema.optional(),
  position: z.number().int().nonnegative().optional(),
  is_collapsed: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  column_id: z.string().uuid(),
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: prioritySchema.optional(),
  position: z.number().int().nonnegative(),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: taskTitleSchema.optional(),
  description: taskDescriptionSchema,
  priority: prioritySchema.optional(),
  column_id: z.string().uuid().optional(),
  position: z.number().int().nonnegative().optional(),
});
