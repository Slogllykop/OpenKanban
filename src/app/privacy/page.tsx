import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black font-sans pb-32">
      {/* Header */}
      <header className="border-b border-neutral-900 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size={24} className="hover:opacity-80 transition-opacity" />
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-24">
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
          Privacy Policy.
        </h1>
        <p className="text-accent font-mono text-sm mb-16">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-12 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
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
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              2. What We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
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
            <h2 className="text-2xl font-display font-bold text-white mb-4">
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
            <h2 className="text-2xl font-display font-bold text-white mb-4">
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
            <h2 className="text-2xl font-display font-bold text-white mb-4">
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
