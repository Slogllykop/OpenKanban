"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";
import { BackgroundLayer } from "@/components/landing/background-layer";
import { CallToAction } from "@/components/landing/call-to-action";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { StorySection } from "@/components/landing/story-section";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <main
      ref={containerRef}
      className="relative overflow-hidden bg-black font-sans text-white selection:bg-accent selection:text-black"
    >
      <ScrollProgress progress={scrollYProgress} />
      <BackgroundLayer scrollYProgress={scrollYProgress} />
      <HeroSection scrollYProgress={scrollYProgress} />

      {/* Extended Story Sections Container */}
      <div className="relative z-20 mt-[10vh] border-neutral-900 border-t bg-black/40 backdrop-blur-md">
        <article className="container mx-auto">
          <StorySection
            title="The No-Friction Manifesto."
            subtitle="Identity by Knowledge"
            text="We eliminated the entire onboarding process. No emails. No passwords. No verifications. If you know the exact URL, you have the keys. Security through obscurity and imagination."
            align="left"
            index={1}
          />
          <StorySection
            title="Keyboard-First Interface."
            subtitle="Speed of Thought"
            text="Don't touch your mouse. Navigate columns, reorder tasks, edit content, and move items across the board entirely via keyboard shortcuts. Power-user features built in by default."
            align="right"
            index={2}
          />
          <StorySection
            title="Realtime. Ephemeral. Permanent."
            subtitle="Zero Latency Sync"
            text="Every keystroke and drag is synced instantly across all active users. Keep a board for a 1-hour brainstorming session or a 1-year project. It lives exactly as long as you need it to."
            align="left"
            index={3}
          />
        </article>

        <ShowcaseSection />
      </div>

      <CallToAction />
      <Footer />
    </main>
  );
}
