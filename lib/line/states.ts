/**
 * Line states (BRIEF.md section 5, point 2).
 *
 * A state is N points in normalised viewport units: `x` as a fraction of the
 * viewport width, `dy` as a fraction of the viewport height *relative to a
 * baseline*. The timeline decides where the baseline sits; the state only
 * carries the shape. Because every state has the same point count in the same
 * order, interpolating between any two of them is a true morph.
 */
import { coverTransform, projectPoint, type RidgeData } from "@/lib/ridge";
import { N, clamp, clipPolylineX, easeInOutQuad, lerp, resampleByArcLength, type Pt } from "./geometry";

export interface LineState {
  x: Float64Array;
  dy: Float64Array;
}

export type MorphMode = "ltr" | "outside-in";

/** the straight line runs a little past both viewport edges */
export const X_MIN = -0.05;
export const X_MAX = 1.05;

export function emptyState(): LineState {
  return { x: new Float64Array(N), dy: new Float64Array(N) };
}

export function copyState(from: LineState, to: LineState = emptyState()): LineState {
  to.x.set(from.x);
  to.dy.set(from.dy);
  return to;
}

export function straightState(): LineState {
  const s = emptyState();
  for (let i = 0; i < N; i++) s.x[i] = X_MIN + ((X_MAX - X_MIN) * i) / (N - 1);
  return s;
}

/**
 * The photographed ridge as it appears in a box of boxW x boxH pixels that the
 * image covers (object-fit: cover), expressed in units of the viewport vw x vh.
 * Returns the state plus the baseline (mean ridge y as a fraction of vh) that
 * puts the shape exactly on the photo when the box sits at the viewport top.
 */
export function ridgeState(
  ridge: RidgeData,
  boxW: number,
  boxH: number,
  vw: number,
  vh: number,
): { state: LineState; baseline: number } {
  const t = coverTransform(ridge.width, ridge.height, boxW, boxH);
  const px: Pt[] = ridge.points.map((p) => projectPoint(p, t));
  const clipped = clipPolylineX(px, X_MIN * vw, X_MAX * vw);
  const pts = snapToVertices(resampleByArcLength(clipped, N), clipped);
  let mean = 0;
  for (const p of pts) mean += p[1];
  mean /= pts.length;
  const state = emptyState();
  for (let i = 0; i < N; i++) {
    state.x[i] = pts[i][0] / vw;
    state.dy[i] = (pts[i][1] - mean) / vh;
  }
  return { state, baseline: mean / vh };
}

/**
 * Moves the resampled point nearest to each source vertex onto that vertex, so
 * every peak and saddle of the ridge is hit exactly instead of being cut by
 * the sample spacing. Points stay in order; spacing changes by half a step at most.
 */
function snapToVertices(samples: Pt[], vertices: Pt[]): Pt[] {
  const out = samples.map((p) => [p[0], p[1]] as Pt);
  const taken = new Set<number>();
  let from = 0;
  for (const v of vertices) {
    let best = -1;
    let bestD = Infinity;
    for (let i = from; i < out.length; i++) {
      const d = Math.hypot(out[i][0] - v[0], out[i][1] - v[1]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
      if (out[i][0] > v[0] + 40) break;
    }
    if (best >= 0 && !taken.has(best)) {
      out[best] = [v[0], v[1]];
      taken.add(best);
      from = best;
    }
  }
  return out;
}

/** horizontally stretches a state around cx (facts ridge: 1.3x) */
export function stretchState(s: LineState, k: number, cx = 0.5): LineState {
  const out = copyState(s);
  for (let i = 0; i < N; i++) out.x[i] = cx + (s.x[i] - cx) * k;
  return out;
}

/** vertically scales a state (swells: small k) */
export function scaleState(s: LineState, k: number): LineState {
  const out = copyState(s);
  for (let i = 0; i < N; i++) out.dy[i] = s.dy[i] * k;
  return out;
}

/**
 * Thread morph (section 5, point 4): every point gets its own delay from its
 * x position, so a shape forms as tension travelling along the thread.
 *   ltr:        t_i = clamp(u * 1.4 - x_i * 0.4)   left to right
 *   outside-in: the outer points move first, the centre last
 */
export function morphInto(out: LineState, a: LineState, b: LineState, u: number, mode: MorphMode): LineState {
  if (u <= 0) return copyState(a, out);
  if (u >= 1) return copyState(b, out);
  for (let i = 0; i < N; i++) {
    const x = clamp(a.x[i]);
    const lag = mode === "ltr" ? x : 1 - 2 * Math.abs(x - 0.5);
    const ti = easeInOutQuad(clamp(u * 1.4 - lag * 0.4));
    out.x[i] = lerp(a.x[i], b.x[i], ti);
    out.dy[i] = lerp(a.dy[i], b.dy[i], ti);
  }
  return out;
}

export interface Extremum {
  index: number;
  x: number;
  dy: number;
  kind: "peak" | "saddle" | "slope";
  prominence: number;
}

/** dy of a state at a normalised x, by linear interpolation (x must be monotonic) */
export function dyAtX(s: LineState, x: number): number {
  if (x <= s.x[0]) return s.dy[0];
  if (x >= s.x[N - 1]) return s.dy[N - 1];
  let i = 1;
  while (i < N - 1 && s.x[i] < x) i++;
  const t = (x - s.x[i - 1]) / (s.x[i] - s.x[i - 1] || 1);
  return lerp(s.dy[i - 1], s.dy[i], t);
}

/** local extrema of a state's height profile, for placing annotations */
export function findExtrema(s: LineState, xMin = 0.06, xMax = 0.94, window = 4): Extremum[] {
  const out: Extremum[] = [];
  for (let i = window; i < N - window; i++) {
    const x = s.x[i];
    if (x < xMin || x > xMax) continue;
    const v = s.dy[i];
    let isPeak = true;
    let isSaddle = true;
    for (let k = 1; k <= window; k++) {
      if (!(v < s.dy[i - k] && v <= s.dy[i + k])) isPeak = false;
      if (!(v > s.dy[i - k] && v >= s.dy[i + k])) isSaddle = false;
    }
    if (!isPeak && !isSaddle) continue;
    // prominence: distance to the mean of a wider neighbourhood
    const lo = Math.max(0, i - 24);
    const hi = Math.min(N - 1, i + 24);
    let mean = 0;
    for (let k = lo; k <= hi; k++) mean += s.dy[k];
    mean /= hi - lo + 1;
    out.push({ index: i, x, dy: v, kind: isPeak ? "peak" : "saddle", prominence: Math.abs(v - mean) });
  }
  return out;
}
