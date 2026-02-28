"use client";

import {
  IconDownload,
  IconTrash,
  IconUpload,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/ui/logo";

interface BoardToolbarProps {
  slug: string;
  viewerCount: number;
  isConnected: boolean;
  onDeleteBoard: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function BoardToolbar({
  slug,
  viewerCount,
  isConnected,
  onDeleteBoard,
  onExport,
  onImport,
}: BoardToolbarProps) {
  const formattedTitle = slug.replaceAll("-", " ");
  const titleWords = formattedTitle.split(" ");
  const displayTitle =
    titleWords.length > 5
      ? `${titleWords.slice(0, 5).join(" ")}...`
      : formattedTitle;

  return (
    <header className="flex shrink-0 items-center justify-between border-border border-b bg-surface-base px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Logo size={24} showText={false} />
        <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
        <h1
          className="truncate font-semibold text-base text-text-primary"
          title={formattedTitle}
        >
          {displayTitle}
        </h1>

        {/* Live viewer count & connection status */}
        {(viewerCount > 1 || !isConnected) && (
          <div className="flex items-center gap-1.5 rounded-full bg-surface-overlay px-2.5 py-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              style={
                isConnected
                  ? { animation: "pulse-dot 2s ease-in-out infinite" }
                  : undefined
              }
            />
            <IconUsers size={12} className="text-text-muted" />
            <span className="font-medium text-[11px] text-text-secondary">
              {viewerCount}
            </span>
          </div>
        )}
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
