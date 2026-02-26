export type Priority = "low" | "medium" | "high" | "urgent";

export interface Board {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  is_collapsed: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
  created_at: string;
  updated_at: string;
}

/** Column with its nested tasks, used for client-side board state */
export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

/** Full board state used by the board component */
export interface BoardState {
  board: Board | null;
  columns: ColumnWithTasks[];
}

/** Payload for creating a new task */
export interface CreateTaskPayload {
  column_id: string;
  title: string;
  description?: string;
  priority?: Priority;
  position: number;
}

/** Payload for updating a task */
export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string | null;
  priority?: Priority;
  column_id?: string;
  position?: number;
}

/** Payload for creating a new column */
export interface CreateColumnPayload {
  board_id: string;
  title: string;
  position: number;
}

/** Payload for updating a column */
export interface UpdateColumnPayload {
  id: string;
  title?: string;
  position?: number;
  is_collapsed?: boolean;
}
