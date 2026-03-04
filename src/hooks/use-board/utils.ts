import { toast } from "sonner";
import type { ColumnWithTasks } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

/** Create a local-only column (not yet persisted to DB) */
export function makeLocalColumn(
  title: string,
  position: number,
  id?: string,
): ColumnWithTasks {
  return {
    id: id || `local-${generateUUID()}`,
    board_id: "",
    title,
    position,
    is_collapsed: false,
    created_at: new Date().toISOString(),
    tasks: [],
  };
}

export function getInitialLocalColumn(): ColumnWithTasks {
  return {
    id: "local-initial-todo",
    board_id: "",
    title: "To Do",
    position: 0,
    is_collapsed: false,
    created_at: "2026-01-01T00:00:00.000Z",
    tasks: [],
  };
}

/** Show a standardized error toast for failed mutations */
export function showMutationError(action: string) {
  toast.error(`Failed to ${action}`, {
    description: "Your changes have been reverted. Please try again.",
  });
}
