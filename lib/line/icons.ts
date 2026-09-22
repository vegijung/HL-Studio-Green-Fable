/**
 * The four one-stroke icons (BRIEF.md section 5, point 7).
 *
 * Each icon is a polyline in a unit box (x and y from 0 to 1, y down). The
 * thread enters at the bottom-left corner (0,1) on the baseline, draws the
 * shape without lifting, and exits at the bottom-right corner (1,1). Where a
 * shape cannot be drawn in one pass, the thread runs back exactly along a
 * line it has already drawn, which stays invisible.
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
 * Websites & Marketing: a browser window with a landscape in it. Up the left
 * edge, over the rounded top, down the right edge; back up to the title bar
 * divider; then along the left edge again to draw the mountain across the
 * window and out along the bottom. Every second pass runs exactly on a line
 * already drawn, so nothing doubles.
 */
const browser: Pt[] = (() => {
  const l = 0.04;
  const r = 0.96;
  const top = 0.2;
  const rad = 0.08;
  const bar = 0.4;
  return [
    [0, 1],
    [l, 1],
    [l, top + rad],
    ...arc(l + rad, top + rad, rad, 180, 270, 8),
    [r - rad, top],
    ...arc(r - rad, top + rad, rad, 270, 360, 8),
    [r, 1],
    [r, bar],
    [l, bar], // title bar divider
    [l, 0.86],
    [0.2, 0.68],
    [0.36, 0.5], // the summit
    [0.5, 0.68],
    [0.6, 0.6],
    [0.74, 0.74],
    [r, 0.82],
    [r, 1],
    [l, 1],
    [1, 1],
  ];
})();

/**
 * Automationen: a gear. Its bottom tooth stands on the baseline; the thread
 * runs along that tooth's tip, up its flank and once round the wheel, tooth
 * by tooth, and comes down the other flank back onto the line.
 */
const loops: Pt[] = (() => {
  const cx = 0.5;
  const outer = 0.4;
  const root = 0.3;
  const cy = 1 - outer;
  const teeth = 8;
  const pitch = 360 / teeth;
  const tip = pitch * 0.34; // angular width of a tooth's tip
  const rootGap = pitch * 0.34; // angular width of the gap between two teeth at the root
  const flank = (pitch - tip - rootGap) / 2;
  const at = (deg: number, r: number): Pt => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const pts: Pt[] = [[0, 1]];
  // the bottom tooth is centred on 90° (straight down); go round with the angle decreasing
  const start = 90 + tip / 2;
  pts.push(at(start, outer));
  for (let k = 0; k < teeth; k++) {
    const a = start - k * pitch;
    pts.push(at(a - tip, outer)); // across the tip
    pts.push(at(a - tip - flank, root)); // down the flank
    pts.push(at(a - tip - flank - rootGap, root)); // along the root
    pts.push(at(a - pitch, outer)); // up the next flank
  }
  pts.push([1, 1]);
  return pts;
})();
/**
 * Backoffice: a sheet with a folded corner, ticked off. Up the left edge,
 * across the top into the fold, down the right edge as far as the tick, the
 * tick out and back on itself, then down and out.
 */
const sheet: Pt[] = (() => {
  const l = 0.2;
  const r = 0.8;
  const top = 0.05;
  const f = 0.14;
  return [
    [0, 1],
    [l, 1],
    [l, top],
    [r - f, top],
    [r - f, top + f],
    [r, top + f],
    [r - f, top], // the fold's diagonal
    [r, top + f],
    [r, 0.42],
    [0.5, 0.74], // the tick, long stroke
    [0.38, 0.62], // short stroke
    [0.5, 0.74],
    [r, 0.42],
    [r, 1],
    [l, 1],
    [1, 1],
  ];
})();

/**
 * Beratung & Schulung: a light bulb. Up the screw base with its two threads,
 * the glass flaring out into the bulb, round the top and down the other side,
 * the filament between the neck's shoulders, then down the base and out.
 */
const bubble: Pt[] = (() => {
  const bl = 0.38;
  const br = 0.62;
  const cx = 0.5;
  const cy = 0.36;
  const rad = 0.3;
  const a0 = 125;
  const a1 = 415;
  const p0: Pt = [cx + rad * Math.cos((a0 * Math.PI) / 180), cy + rad * Math.sin((a0 * Math.PI) / 180)];
  const filament: Pt[] = [
    [br, 0.8],
    [0.56, 0.6],
    [cx, 0.68],
    [0.44, 0.6],
    [bl, 0.8],
  ];
  return [
    [0, 1],
    [bl, 1],
    [bl, 0.93],
    [br, 0.93], // thread
    [bl, 0.93],
    [bl, 0.87],
    [br, 0.87], // thread
    [bl, 0.87],
    [bl, 0.8],
    p0,
    ...arc(cx, cy, rad, a0, a1, 48).slice(1),
    [br, 0.8],
    ...filament.slice(1),
    ...filament.slice(0, -1).reverse(),
    [br, 1],
    [bl, 1],
    [1, 1],
  ];
})();
export const ICONS: Record<IconName, Pt[]> = { browser, loops, sheet, bubble };

/**
 * Moves the sample nearest (by arc length) to each vertex of the source
 * polyline onto that vertex, so corners and stroke reversals are hit exactly
 * instead of being cut by the sample spacing. Samples stay in order.
 */
function snapToPolyline(samples: Pt[], poly: Pt[]): Pt[] {
  const out = samples.map((p) => [p[0], p[1]] as Pt);
  const cum = [0];
  for (let i = 1; i < poly.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  }
  const total = cum[cum.length - 1] || 1;
  let last = -1;
  for (let k = 0; k < poly.length; k++) {
    let idx = Math.round((cum[k] / total) * (out.length - 1));
    if (idx <= last) idx = last + 1;
    if (idx >= out.length) break;
    out[idx] = [poly[k][0], poly[k][1]];
    last = idx;
  }
  return out;
}

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
  const iconPts = snapToPolyline(resampleByArcLength(boxPx, m), boxPx);
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
