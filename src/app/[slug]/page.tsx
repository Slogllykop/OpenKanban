import type { Metadata } from "next";
import { Board } from "@/components/board/board";
import { Unavailable } from "@/components/board/Unavailable";
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
    title: `${slug}`,
    description: `Private, real-time Kanban board for ${slug}.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let boardData = null;

  try {
    boardData = await getFullBoard(supabase, slug);
  } catch (error) {
    console.error(`[BoardPage] Failed to fetch board data for ${slug}:`, error);

    return <Unavailable slug={slug} />;
  }

  return (
    <Board
      slug={slug}
      initialBoard={boardData?.board ?? null}
      initialColumns={boardData?.columns ?? []}
    />
  );
}
