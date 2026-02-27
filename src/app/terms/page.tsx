import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function TermsPage() {
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
          Terms of Service.
        </h1>
        <p className="text-accent font-mono text-sm mb-16">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-12 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing or using OpenKanban ("Service"), you agree to be
              bound by these Terms of Service. If you disagree with any part of
              the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              2. The Manifesto of "No Friction"
            </h2>
            <p className="mb-4">
              OpenKanban operates without traditional user accounts, passwords,
              or emails. Access to any board is dictated entirely by knowledge
              of the specific URL slug.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>
                  You are entirely responsible for keeping your board URL
                  private.
                </strong>{" "}
                We cannot recover lost URLs.
              </li>
              <li>
                Anyone with the URL can read, write, and delete contents on that
                board.
              </li>
              <li>
                Security is derived through URL obscurity and your imagination
                in choosing complex board names.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              3. Ephemeral Nature of Data
            </h2>
            <p className="mb-4">
              While we strive to keep your data synced and available, OpenKanban
              is designed as a fast, frictionless tool. You acknowledge that
              data may be considered ephemeral and we do not guarantee permanent
              backup or retention of your boards. Ensure you export or save
              critical information elsewhere.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              4. Acceptable Use
            </h2>
            <p className="mb-4">You agree not to use the Service:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                In any way that violates any applicable national or
                international law or regulation.
              </li>
              <li>
                To store, transmit, or share malicious code, malware, or illegal
                content.
              </li>
              <li>
                To attempt to guess, brute-force, or enumerate active board
                URLs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              5. Disclaimer of Warranties
            </h2>
            <p className="mb-4">
              The Service is provided "AS IS" and "AS AVAILABLE", without
              warranty of any kind. We make no guarantees regarding the
              continuous availability, reliability, or security of the Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
