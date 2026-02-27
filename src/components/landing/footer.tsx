import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="relative z-20 mx-auto w-full border-neutral-900 border-t bg-black px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo size={32} />

          <p className="max-w-xs text-center text-neutral-500 text-sm md:text-left">
            The fastest way to organize your thoughts. No signups, no downloads,
            just flow.
          </p>
        </div>

        <div className="flex items-center gap-6 font-medium text-neutral-400 text-sm tracking-wide">
          <a
            href="https://github.com/Slogllykop/OpenKanban"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>GitHub</title>
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.3 6.5-1.5 6.5-7.1a5.2 5.2 0 0 0-1.5-3.8 4.8 4.8 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C5.5 1.6 4.3 2 4.3 2a4.8 4.8 0 0 0-.1 3.8 5.2 5.2 0 0 0-1.5 3.8c0 5.6 3.3 6.8 6.5 7.1a4.8 4.8 0 0 0-1 2.8v4.2"></path>
            </svg>
            GitHub
          </a>
          <a href="/terms" className="transition-colors hover:text-accent">
            Terms
          </a>
          <a href="/privacy" className="transition-colors hover:text-accent">
            Privacy
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-neutral-900 border-t pt-8 text-neutral-600 text-xs md:flex-row">
        <p>© {new Date().getFullYear()} OpenKanban. All rights reserved.</p>
        <p>
          Designed & Built by{" "}
          <a
            href="https://github.com/Slogllykop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 transition-colors hover:text-accent"
          >
            Slogllykop
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
