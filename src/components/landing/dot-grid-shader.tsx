"use client";

import { useCallback, useEffect, useRef } from "react";

const DOT_DENSITY = 0.0052; // dots per square pixel — keeps count reasonable
const DOT_BASE_RADIUS = 1.0;
const DOT_MAX_RADIUS = 3.0;
const MOUSE_INFLUENCE_RADIUS = 320;
const DISTORT_STRENGTH = 15; // max displacement in px
const BASE_ALPHA = 0.13;
const MAX_ALPHA = 0.75;
const LERP_SPEED = 0.08;

// Yellow accent matching the design system
const DOT_COLOR_R = 225;
const DOT_COLOR_G = 255;
const DOT_COLOR_B = 0;

interface Dot {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
}

/** Deterministic pseudo-random (mulberry32) so layout is stable across frames */
function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDots(count: number, seed = 42): Dot[] {
  const rng = mulberry32(seed);
  const dots: Dot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({ x: rng(), y: rng() });
  }
  return dots;
}

export const DotGridShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothMouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dotsRef = useRef<Dot[]>([]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = rect.width;
    const h = rect.height;
    sizeRef.current = { w, h };
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    // Regenerate dot count based on viewport area
    const area = w * h;
    const count = Math.round(area * DOT_DENSITY);
    dotsRef.current = generateDots(count);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    handleResize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Smooth mouse interpolation
      smoothMouseRef.current.x +=
        (mouseRef.current.x - smoothMouseRef.current.x) * LERP_SPEED;
      smoothMouseRef.current.y +=
        (mouseRef.current.y - smoothMouseRef.current.y) * LERP_SPEED;

      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      const influenceRadiusSq = MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const baseX = dot.x * w;
        const baseY = dot.y * h;

        const dx = baseX - mx;
        const dy = baseY - my;
        const distSq = dx * dx + dy * dy;

        let alpha = BASE_ALPHA;
        let radius = DOT_BASE_RADIUS;
        let drawX = baseX;
        let drawY = baseY;

        if (distSq < influenceRadiusSq) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / MOUSE_INFLUENCE_RADIUS;
          const eased = t * t * t; // cubic ease for smooth falloff

          alpha = BASE_ALPHA + (MAX_ALPHA - BASE_ALPHA) * eased;
          radius = DOT_BASE_RADIUS + (DOT_MAX_RADIUS - DOT_BASE_RADIUS) * eased;

          // Distort: push dots away from cursor
          if (dist > 0.1) {
            const pushT = t * t; // quadratic push
            drawX += (dx / dist) * DISTORT_STRENGTH * pushT;
            drawY += (dy / dist) * DISTORT_STRENGTH * pushT;
          }
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_COLOR_R},${DOT_COLOR_G},${DOT_COLOR_B},${alpha})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Start the render loop
    animFrameRef.current = requestAnimationFrame(draw);

    // Window-level events for reliable mouse tracking through z-layers
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
};
