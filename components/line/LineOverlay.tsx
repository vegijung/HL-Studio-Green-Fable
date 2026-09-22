"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import ridgeJson from "@/content/ridge.json";
import { toRidgeData } from "@/lib/ridge";
import { LineEngine } from "@/lib/line/engine";
import { setupHero } from "@/lib/line/hero";

const ridge = toRidgeData(ridgeJson);

/**
 * The one line: a fixed, full-viewport SVG with a single path, below text
 * (z-20) and above backgrounds (z-0). Mounts the engine, Lenis and the hero
 * motion on desktop; stays empty below 1024px and under reduced motion, where
 * the static hairlines in the sections remain visible.
 */
export function LineOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    gsap.registerPlugin(ScrollTrigger);

    // the engine runs only while the viewport is desktop-sized; below that the static hairlines take over
    let stop: (() => void) | null = null;
    const start = () => {
      // anchor targets carry scroll-margin-top for the nav; Lenis only smooths the jump
      const lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const engine = new LineEngine(svg, ridge);
      engine.start();
      const hero = document.getElementById("hero");
      const cleanupHero = hero ? setupHero(engine, hero) : undefined;
      return () => {
        cleanupHero?.();
        engine.destroy();
        gsap.ticker.remove(raf);
        lenis.destroy();
        svg.querySelector("[data-line-path]")?.setAttribute("d", "");
      };
    };
    const apply = () => {
      const wanted = desktop.matches && !reduced.matches;
      if (wanted && !stop) stop = start();
      else if (!wanted && stop) {
        stop();
        stop = null;
      }
    };
    apply();
    desktop.addEventListener("change", apply);
    reduced.addEventListener("change", apply);

    return () => {
      desktop.removeEventListener("change", apply);
      reduced.removeEventListener("change", apply);
      stop?.();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      data-line-overlay
      preserveAspectRatio="none"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
    >
      <defs>
        <mask id="line-gaps" maskUnits="userSpaceOnUse">
          <rect data-mask-bg x="0" y="0" width="100%" height="100%" fill="white" />
          <g data-mask-rects />
        </mask>
      </defs>
      <path
        data-line-path
        fill="none"
        stroke="#2e4b3f"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        mask="url(#line-gaps)"
      />
    </svg>
  );
}
