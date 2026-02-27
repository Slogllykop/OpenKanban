import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "OpenKanban - Terms of Service",
  description:
    "Read the terms of service for OpenKanban. Understand our ephemeral data policy and frictionless manifesto.",
};

export default function TermsPage() {
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
          Terms of Service.
        </h1>
        <p className="mb-16 font-mono text-accent text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-12 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing or using OpenKanban ("Service"), you agree to be
              bound by these Terms of Service. If you disagree with any part of
              the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              2. The Manifesto of "No Friction"
            </h2>
            <p className="mb-4">
              OpenKanban operates without traditional user accounts, passwords,
              or emails. Access to any board is dictated entirely by knowledge
              of the specific URL slug.
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
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
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
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
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
              4. Acceptable Use
            </h2>
            <p className="mb-4">You agree not to use the Service:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
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
            <h2 className="mb-4 font-bold font-display text-2xl text-white">
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
