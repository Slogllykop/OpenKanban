import { IconCloudOff } from "@tabler/icons-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

interface UnavailableProps {
  slug: string;
}

export function Unavailable({ slug }: UnavailableProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white selection:bg-accent selection:text-black">
      {/* Top Branding */}
      <div className="absolute top-8 left-8">
        <Logo />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="relative flex flex-col items-center rounded-3xl border border-white/5 bg-zinc-950/50 p-10 text-center backdrop-blur-xl md:p-14">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-red-500 ring-1 ring-white/5 backdrop-blur-sm">
            <IconCloudOff size={40} strokeWidth={1.5} />
          </div>

          <h2 className="mb-4 font-bold font-display text-3xl text-white tracking-tight md:text-4xl">
            Connection Offline.
          </h2>

          <p className="mb-10 max-w-sm font-sans text-lg text-zinc-400 leading-relaxed">
            We're unable to connect to our database nodes at the moment. This is
            likely a temporary interruption. Please re-visit in a few hours.
          </p>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href={`/${slug}`}
              className="group relative flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-accent px-8 font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] sm:min-w-[160px]"
            >
              <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20" />
              Try again
            </a>

            <Link
              href="/"
              className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98] sm:min-w-[160px]"
            >
              Return to home
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-3 font-medium text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
            <span className="h-px w-8 bg-zinc-800" />
            Node Status: Sync Interrupted
            <span className="h-px w-8 bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
