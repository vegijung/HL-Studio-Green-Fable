"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hairline } from "@/components/Hairline";
import ridgeJson from "@/content/ridge.json";
import { toRidgeData } from "@/lib/ridge";
import { pickFactSpots } from "@/lib/line/facts";
import { ridgeState, stretchState } from "@/lib/line/states";
import { cx } from "@/lib/cx";
import type { Fact } from "@/content/types";

const ridge = toRidgeData(ridgeJson);

/** space reserved above a spot for numeral, label and leader */
const LABEL_H = 150;
const LEADER = 22;
/** minimum horizontal gap between two labels */
const LABEL_GAP = 18;
/** the spot must lie at least this far inside its label's horizontal span */
const LABEL_MARGIN = 14;

interface Spot {
  fact: number;
  kind: "peak" | "saddle";
  /** spot position in container px */
  x: number;
  bottom: number;
}

interface Layout {
  height: number;
  baseline: number;
  spots: Spot[];
}

/**
 * Labels start centred on their spot and are pushed apart until none overlap,
 * while each spot stays inside its label's span so the leader reads.
 */
function resolveLefts(xs: number[], widths: number[], minX: number, maxX: number): number[] {
  const n = xs.length;
  const lo = (i: number) => Math.max(minX, xs[i] - widths[i] + LABEL_MARGIN);
  const hi = (i: number) => Math.min(maxX - widths[i], xs[i] - LABEL_MARGIN);
  const lefts = xs.map((x, i) => {
    const centred = x - widths[i] / 2;
    return lo(i) <= hi(i) ? Math.min(hi(i), Math.max(lo(i), centred)) : centred;
  });
  for (let i = 1; i < n; i++) {
    const min = lefts[i - 1] + widths[i - 1] + LABEL_GAP;
    if (lefts[i] < min) lefts[i] = Math.min(hi(i), min);
  }
  for (let i = n - 2; i >= 0; i--) {
    const max = lefts[i + 1] - LABEL_GAP - widths[i];
    if (lefts[i] > max) lefts[i] = Math.max(lo(i), max);
  }
  return lefts;
}

/**
 * Desktop facts: the six annotations sit on real peaks and saddles of the
 * facts ridge (the hero ridge stretched 1.3x), computed from the same state
 * the engine draws. The baseline hairline is the engine's anchor; when the
 * line reaches it, the section pins for 60vh while the ridge flattens.
 */
export function FactsRidge({ facts }: { facts: Fact[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [lefts, setLefts] = useState<number[] | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const hero = document.getElementById("hero");
      const box = hero ? hero.getBoundingClientRect() : { width: vw, height: vh };
      const { state } = ridgeState(ridge, box.width, box.height, vw, vh);
      const spots = pickFactSpots(
        stretchState(state, 1.3),
        facts.length,
        facts.map((f) => Math.max(Math.min(f.value.length, 8) * 3, Math.min(f.label.length, 17))),
      );
      if (spots.length === 0) return;
      const summit = Math.min(...spots.map((s) => s.dy));
      const low = Math.max(...spots.map((s) => s.dy));
      const above = -summit * vh + LABEL_H + LEADER;
      const below = Math.max(0.06 * vh, low * vh + 24);
      const height = Math.round(above + below);
      const baseline = Math.round(above);
      const left = el.getBoundingClientRect().left;
      setLefts(null);
      setLayout({
        height,
        baseline,
        spots: spots.map((s) => ({
          fact: s.fact,
          kind: s.kind,
          x: s.x * vw - left,
          bottom: height - (baseline + s.dy * vh),
        })),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [facts]);

  // second pass: measure the rendered labels and push them apart
  useLayoutEffect(() => {
    if (!layout || !ref.current) return;
    const widths = layout.spots.map((_, i) => labelRefs.current[i]?.offsetWidth ?? 0);
    // labels may overflow the content column but stay inside the viewport
    const left = ref.current.getBoundingClientRect().left;
    setLefts(resolveLefts(layout.spots.map((s) => s.x), widths, 24 - left, window.innerWidth - left - 24));
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [layout]);

  return (
    <div
      ref={ref}
      data-facts-ridge
      className="relative"
      style={{ height: layout ? layout.height : "55vh" }}
    >
      <div className="absolute inset-x-0" style={{ top: layout ? layout.baseline : "60%" }}>
        <Hairline anchor="facts" shape="ridge-facts" pin="60%" pinTarget="#fakten" pinAt={0.42} />
      </div>

      {layout?.spots.map((spot, i) => {
        const fact = facts[spot.fact];
        const wrap = fact.value.length > 8;
        return (
          <div key={fact.value}>
            <span
              aria-hidden
              className="absolute w-px bg-fog"
              style={{ left: spot.x, bottom: spot.bottom, height: LEADER }}
            />
            <div
              ref={(node) => {
                labelRefs.current[i] = node;
              }}
              data-line-gap
              className="absolute w-max max-w-[17ch] text-center"
              style={{
                left: lefts ? lefts[i] : spot.x,
                bottom: spot.bottom + LEADER + 6,
                visibility: lefts ? "visible" : "hidden",
              }}
            >
              <p
                className={cx(
                  "mx-auto font-serif text-[clamp(2.25rem,3.2vw,3.5rem)] leading-[0.95] tracking-[-0.02em]",
                  wrap && "max-w-[6.5ch]",
                )}
                style={{ whiteSpace: wrap ? "normal" : "nowrap", fontVariantNumeric: "lining-nums" }}
              >
                {fact.value}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-charcoal/70">{fact.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
