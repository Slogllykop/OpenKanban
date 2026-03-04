import type { Board, ColumnWithTasks } from "@/lib/types";

export interface UseBoardOptions {
  slug: string;
  initialBoard: Board | null;
  initialColumns: ColumnWithTasks[];
  /** Called after every DB write - used to trigger broadcast sync */
  onMutation?: () => void;
}
