export function BoardSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-surface-base">
      {/* Toolbar skeleton */}
      <header className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-28 animate-pulse rounded-md bg-surface-overlay" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-surface-overlay" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 animate-pulse rounded-md bg-surface-overlay" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-surface-overlay" />
        </div>
      </header>

      {/* Columns skeleton */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4 md:p-6">
        {[0, 1, 2].map((colIdx) => (
          <div
            key={colIdx}
            className="flex w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl bg-surface-overlay/50 p-2"
          >
            {/* Column header skeleton */}
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 animate-pulse rounded bg-surface-overlay" />
                <div className="h-4 w-6 animate-pulse rounded-full bg-surface-overlay" />
              </div>
              <div className="h-6 w-6 animate-pulse rounded bg-surface-overlay" />
            </div>

            {/* Task card skeletons */}
            <div className="flex flex-col gap-2 p-1">
              {Array.from({ length: 3 - colIdx }, (_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  key={i}
                  className="rounded-lg border border-border bg-surface-raised p-3"
                  style={{
                    background:
                      "linear-gradient(90deg, #0a0a0a 25%, #151515 50%, #0a0a0a 75%)",
                    backgroundSize: "200% 100%",
                    animation: `shimmer 1.5s ease-in-out infinite`,
                    animationDelay: `${(colIdx + i) * 200}ms`,
                  }}
                >
                  <div className="h-3.5 w-3/4 rounded bg-surface-overlay/50" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-surface-overlay/30" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-4 w-10 rounded-full bg-surface-overlay/40" />
                    <div className="h-3 w-12 rounded bg-surface-overlay/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
