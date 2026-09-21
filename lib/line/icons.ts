/**
 * The four one-stroke icons (BRIEF.md section 5, point 7).
 *
 * Each icon is a polyline in a unit box (x and y from 0 to 1, y down). The
 * thread enters at the bottom-left corner (0,1) on the baseline, draws the
 * shape without lifting, and exits at the bottom-right corner (1,1). Retracing
 * a segment is allowed. Complexity rises from the browser to the loops, then
 * falls again to the sheet and the bubble.
 */
import { N, resampleByArcLength, type Pt } from "./geometry";
import { emptyState, type LineState } from "./states";

export type IconName = "browser" | "loops" | "sheet" | "bubble";

/** points on a circle, angles in degrees, screen coordinates (y down) */
function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, steps: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/**
 * Websites: a browser window. Up the left edge with two text lines and the
 * address field drawn on the way, across the top, the title bar divider, down
 * the right edge, and out along the bottom (retraced).
 */
const browser: Pt[] = [
  [0, 1],
  [0.08, 1],
  [0.08, 0.74],
  [0.5, 0.74], // text line
  [0.08, 0.74],
  [0.08, 0.6],
  [0.68, 0.6], // text line
  [0.08, 0.6],
  [0.08, 0.36],
  [0.4, 0.36], // address field
  [0.4, 0.28],
  [0.08, 0.28],
  [0.08, 0.2],
  [0.92, 0.2], // title bar divider
  [0.08, 0.2],
  [0.08, 0.06],
  [0.92, 0.06],
  [0.92, 1],
  [0.08, 1],
  [1, 1],
];

/**
 * Automationen: the thread feeding back into itself, a figure of eight made of
 * two overlapping loops that stand on the baseline: up into the left loop,
 * across the crossing into the right loop, back down to the baseline.
 */
const loops: Pt[] = (() => {
  // a lemniscate (figure of eight) whose two lobes touch the baseline; the thread
  // enters at the left lobe's lowest point, runs the whole figure through the
  // centre crossing twice, and leaves the same point moving right
  const a = 0.8;
  const cy = 1 - a / 2;
  const pts: Pt[] = [[0, 1]];
  const steps = 96;
  const t0 = (7 * Math.PI) / 4;
  for (let i = 0; i <= steps; i++) {
    const t = t0 + (2 * Math.PI * i) / steps;
    pts.push([0.5 + 0.5 * Math.sin(t), cy - (a / 2) * Math.sin(2 * t)]);
  }
  pts.push([1, 1]);
  return pts;
})();

/**
 * Backoffice: a sheet of paper with a folded corner and three lines of text,
 * the fold traced twice.
 */
const sheet: Pt[] = [
  [0, 1],
  [0.24, 1],
  [0.76, 1],
  [0.76, 0.3],
  [0.6, 0.14],
  [0.6, 0.3],
  [0.76, 0.3],
  [0.6, 0.14],
  [0.24, 0.14],
  [0.24, 0.42],
  [0.6, 0.42], // text
  [0.24, 0.42],
  [0.24, 0.56],
  [0.62, 0.56], // text
  [0.24, 0.56],
  [0.24, 0.7],
  [0.5, 0.7], // text
  [0.24, 0.7],
  [0.24, 1],
  [1, 1],
];

/** Beratung & Schulung: a speech bubble with a small tail, the simplest of the four */
const bubble: Pt[] = (() => {
  const r = 0.12;
  const top = 0.14;
  const bottom = 0.7;
  const left = 0.08;
  const right = 0.92;
  return [
    [0, 1],
    [0.22, 1], // tail tip on the baseline
    [0.38, bottom],
    ...arc(right - r, bottom - r, r, 90, 0, 6), // bottom-right corner
    ...arc(right - r, top + r, r, 0, -90, 6), // top-right
    ...arc(left + r, top + r, r, -90, -180, 6), // top-left
    ...arc(left + r, bottom - r, r, 180, 90, 6), // bottom-left
    [0.26, bottom],
    [0.22, 1],
    [1, 1],
  ];
})();

export const ICONS: Record<IconName, Pt[]> = { browser, loops, sheet, bubble };

/** an icon's box on the viewport, in normalised units */
export interface IconBox {
  /** left edge as a fraction of the viewport width */
  x0: number;
  /** width and height as fractions of viewport width and height */
  w: number;
  h: number;
}

/**
 * How the N points are shared between the baseline left of the icon, the icon
 * itself and the baseline right of it. Every stage state uses the same
 * partition, so point i always sits at the same fraction of the stroke and a
 * morph between two icons is a true morph, not a reshuffle.
 */
export interface Partition {
  left: number;
  icon: number;
  right: number;
}

/** the stage's partition: most points go to the icon, the short baseline stubs need few */
export const STAGE_PARTITION: Partition = { left: 20, icon: N - 40, right: 20 };

/**
 * Builds the state "a straight line from xMin to xMax with this icon standing
 * on it". The icon's points are spaced evenly by arc length; the remaining
 * points stay on the baseline left and right of the box.
 */
export function iconState(
  icon: Pt[],
  box: IconBox,
  vw: number,
  vh: number,
  xMin: number,
  xMax: number,
  partition: Partition = STAGE_PARTITION,
): LineState {
  const { left: nl, icon: m, right: nr } = partition;
  const boxPx = icon.map(([x, y]) => [x * box.w * vw, y * box.h * vh] as Pt);
  const iconPts = resampleByArcLength(boxPx, m);
  const s = emptyState();
  let i = 0;
  for (let k = 0; k < nl; k++, i++) {
    s.x[i] = xMin + ((box.x0 - xMin) * k) / nl;
    s.dy[i] = 0;
  }
  for (let k = 0; k < m; k++, i++) {
    s.x[i] = box.x0 + iconPts[k][0] / vw;
    s.dy[i] = (iconPts[k][1] - box.h * vh) / vh; // y=1 (bottom) sits on the baseline
  }
  const x1 = box.x0 + box.w;
  for (let k = 0; i < N; k++, i++) {
    s.x[i] = x1 + ((xMax - x1) * (k + 1)) / nr;
    s.dy[i] = 0;
  }
  return s;
}

/**
 * The plain segment from xMin to xMax with the same partition as the icons:
 * the icon's points lie flat across the box, so a morph from the segment into
 * an icon lifts the thread out of the baseline instead of sliding it sideways.
 */
export function segmentState(
  box: IconBox,
  vw: number,
  vh: number,
  xMin: number,
  xMax: number,
  partition: Partition = STAGE_PARTITION,
): LineState {
  const flat: Pt[] = [
    [0, 1],
    [1, 1],
  ];
  return iconState(flat, box, vw, vh, xMin, xMax, partition);
}
