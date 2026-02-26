"use client";

import {
  IconDownload,
  IconTrash,
  IconUpload,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface BoardToolbarProps {
  slug: string;
  viewerCount: number;
  onDeleteBoard: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function BoardToolbar({
  slug,
  viewerCount,
  onDeleteBoard,
  onExport,
  onImport,
}: BoardToolbarProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface-base px-4 py-3 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="truncate text-base font-semibold text-text-primary">
          {slug.replaceAll("-", " ")}
        </h1>

        {/* Live viewer count */}
        <div className="flex items-center gap-1.5 rounded-full bg-surface-overlay px-2.5 py-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-500"
            style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          <IconUsers size={12} className="text-text-muted" />
          <span className="text-[11px] font-medium text-text-secondary">
            {viewerCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          title="Import board"
        >
          <IconUpload size={16} />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          title="Export board"
        >
          <IconDownload size={16} />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onDeleteBoard}
          title="Delete board"
        >
          <IconTrash size={16} />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </header>
  );
}
