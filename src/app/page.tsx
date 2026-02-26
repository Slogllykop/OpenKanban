"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [slug, setSlug] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = slug.trim();
    if (!trimmed) return;
    router.push(`/${trimmed}`);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            OpenKanban
          </h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-500">
            Type anything below to create or open your board.
            <br />
            <span className="text-neutral-600">
              No signup. No login. Just boards.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <div className="flex items-center gap-0 rounded-lg border border-neutral-800 bg-neutral-950 focus-within:border-[#E8967D] transition-colors">
            <span className="pl-4 text-sm text-neutral-600 select-none">
              openkanban.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-project-board"
              className="flex-1 bg-transparent py-3 pr-4 text-sm text-white placeholder-neutral-700 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!slug.trim()}
            className="w-full rounded-lg bg-[#E8967D] py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Open Board
          </button>
        </form>

        <p className="text-xs text-neutral-700">
          Your URL is your password. Share it wisely.
        </p>
      </main>
    </div>
  );
}
