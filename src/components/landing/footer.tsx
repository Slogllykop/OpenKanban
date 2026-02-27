import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="relative z-20 bg-black border-t border-neutral-900 py-12 px-6 md:px-12 mx-auto w-full">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <Logo size={32} />

          <p className="text-neutral-500 text-sm max-w-xs text-center md:text-left">
            The fastest way to organize your thoughts. No signups, no downloads,
            just flow.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-neutral-400 font-medium tracking-wide">
          <a
            href="https://github.com/Slogllykop/OpenKanban"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors flex items-center gap-2"
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
          <a href="/terms" className="hover:text-accent transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-accent transition-colors">
            Privacy
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
        <p>© {new Date().getFullYear()} OpenKanban. All rights reserved.</p>
        <p>
          Designed & Built by{" "}
          <a
            href="https://github.com/Slogllykop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-accent transition-colors"
          >
            Slogllykop
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
