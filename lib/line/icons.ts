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

/** Websites: a browser window, rectangle clockwise, one short inner stroke for the address bar */
const browser: Pt[] = [
  [0, 1],
  [0.1, 1],
  [0.1, 0.36],
  [0.44, 0.36],
  [0.1, 0.36],
  [0.1, 0.18],
  [0.9, 0.18],
  [0.9, 1],
  [0.1, 1],
  [1, 1],
];

/** Automationen: two interlocking loops, the thread feeding back into itself */
const loops: Pt[] = [
  [0, 1],
  [0.3, 1],
  ...arc(0.3, 0.7, 0.3, 90, 450, 32).slice(1),
  [0.7, 1],
  ...arc(0.7, 0.7, 0.3, 90, -270, 32).slice(1),
  [1, 1],
];

/** Backoffice: a sheet of paper with a folded corner */
const sheet: Pt[] = [
  [0, 1],
  [0.22, 1],
  [0.78, 1],
  [0.78, 0.34],
  [0.6, 0.16],
  [0.6, 0.34],
  [0.78, 0.34],
  [0.6, 0.16],
  [0.22, 0.16],
  [0.22, 1],
  [1, 1],
];

/** Beratung & Schulung: a speech bubble with a small tail, the simplest of the four */
const bubble: Pt[] = (() => {
  const r = 0.12;
  const top = 0.2;
  const bottom = 0.72;
  const left = 0.1;
  const right = 0.9;
  return [
    [0, 1],
    [0.22, 1], // tail tip on the baseline
    [0.36, bottom],
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

function polylineLength(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
}

/**
 * Builds the state "straight line with this icon standing on it": the icon
 * gets as many points as its stroke needs at the baseline's point spacing,
 * the remaining points stay on the baseline left and right of it.
 */
export function iconState(
  icon: Pt[],
  box: IconBox,
  vw: number,
  vh: number,
  xMin: number,
  xMax: number,
): LineState {
  const boxPx = icon.map(([x, y]) => [x * box.w * vw, y * box.h * vh] as Pt);
  const iconLen = polylineLength(boxPx);
  const baselineLen = (xMax - xMin) * vw;
  const spacing = baselineLen / (N - 1);
  const m = Math.max(40, Math.min(150, Math.round(iconLen / spacing)));
  const leftLen = (box.x0 - xMin) * vw;
  const rightLen = (xMax - box.x0 - box.w) * vw;
  const rest = N - m;
  const nl = Math.max(2, Math.round((rest * leftLen) / (leftLen + rightLen)));
  const nr = Math.max(2, rest - nl);

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
