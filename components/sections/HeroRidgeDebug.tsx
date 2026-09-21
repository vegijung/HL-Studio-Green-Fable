"use client";

import { useEffect, useState } from "react";
import ridgeJson from "@/content/ridge.json";
import { projectRidge, toRidgeData } from "@/lib/ridge";

const ridge = toRidgeData(ridgeJson);

/**
 * Development aid: draws the extracted ridge over the hero photo through the
 * same cover math the image uses. Only renders when the URL carries ?ridge=1.
 * Phase 3 replaces this with the real line.
 */
export function HeroRidgeDebug() {
  const [points, setPoints] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("ridge") !== "1") return;
    const section = document.getElementById("hero");
    if (!section) return;
    const update = () => {
      const { width, height } = section.getBoundingClientRect();
      const projected = projectRidge(ridge, width, height);
      setPoints(projected.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
    };
    const observer = new ResizeObserver(update);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!points) return null;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
    >
      <polyline points={points} fill="none" stroke="#ff2020" strokeWidth="1.5" />
    </svg>
  );
}
