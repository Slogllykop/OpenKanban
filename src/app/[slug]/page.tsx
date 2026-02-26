import type { Metadata } from "next";
import { Board } from "@/components/board/board";
import { getFullBoard } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

interface BoardPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — OpenKanban`,
    description: `Kanban board for ${slug}`,
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const boardData = await getFullBoard(supabase, slug);

  return (
    <Board
      slug={slug}
      initialBoard={boardData?.board ?? null}
      initialColumns={boardData?.columns ?? []}
    />
  );
}
