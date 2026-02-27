import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "OpenKanban - Privacy Policy",
  description:
    "Learn how OpenKanban handles your data with extreme frictionlessness. We collect minimal data and do not track you.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black pb-32 font-sans text-white selection:bg-accent selection:text-black">
      {/* Header */}
      <header className="border-neutral-900 border-b px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Logo size={24} className="transition-opacity hover:opacity-80" />
          <Link
            href="/"
            className="text-neutral-400 text-sm transition-colors hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pt-24">
        <h1 className="mb-6 font-bold font-display text-5xl tracking-tight md:text-6xl">
          Privacy Policy.
        </h1>
        <p className="mb-16 font-mono text-accent text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-12 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              1. Data Collection Philosophy
            </h2>
            <p className="mb-4">
              OpenKanban's core philosophy is extreme frictionlessness. As a
              direct result, we gather the absolute minimum amount of data
              required to make the service function.
            </p>
            <p className="mb-4 font-bold text-white">
              We do not track you. We do not require emails, names, or
              passwords.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              2. What We Collect
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Board Data:</strong> The text content, structures, and
                states of the Kanban boards you create are stored in our
                database strictly to synchronize them between your active
                sessions.
              </li>
              <li>
                <strong>Anonymous Analytics:</strong> We may collect totally
                anonymous telemetry (like page views or error logs) purely to
                ensure the service remains stable and fast. This data cannot be
                tied back to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              3. Data Visibility & Security
            </h2>
            <p className="mb-4">
              Because OpenKanban does not use authentication,{" "}
              <strong>
                anyone who knows or guesses the exact URL slug of your board can
                view, edit, and delete its contents.
              </strong>
            </p>
            <p className="mb-4 text-neutral-400 italic">
              Please do not store highly sensitive personal information,
              cryptographic keys, or confidential financial data on OpenKanban.
              By design, security is derived from the obscurity of your board
              name.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              4. Third-Party Services
            </h2>
            <p className="mb-4">
              We do not sell, rent, or trade your board content with any third
              parties. Code hosting and deployment may utilize secure
              third-party infrastructure (like Vercel or cloud databases), which
              comply with standard security and privacy frameworks for data at
              rest.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              5. Deletion & Retention
            </h2>
            <p className="mb-4">
              You can manually delete data from your board at any time, which
              deletes it from our active synchronization state. We do not
              explicitly design the system for permanent archival purposes.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
