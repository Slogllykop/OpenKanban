import type { ColumnWithTasks } from "@/lib/types";

interface ExportData {
  version: 1;
  exportedAt: string;
  board: {
    slug: string;
    columns: {
      title: string;
      position: number;
      tasks: {
        title: string;
        description: string | null;
        priority: string;
        position: number;
      }[];
    }[];
  };
}

/**
 * Export the current board state as a JSON file download.
 */
export function exportBoard(slug: string, columns: ColumnWithTasks[]) {
  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    board: {
      slug,
      columns: columns.map((col) => ({
        title: col.title,
        position: col.position,
        tasks: col.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          position: task.position,
        })),
      })),
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `openkanban-${slug}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type { ExportData };
