/**
 * Picks the six annotation positions on the facts ridge (BRIEF.md section 7).
 *
 * Candidates are the local peaks and saddles of the ridge. The chosen set
 * maximises total prominence under a minimum horizontal spacing (dynamic
 * programming over the candidates in x order), with the highest peak forced
 * in: it gets "5 Tage". Returned in left-to-right order.
 */
import { dyAtX, findExtrema, type Extremum, type LineState } from "./states";

export interface FactSpot {
  x: number;
  dy: number;
  kind: "peak" | "saddle" | "slope";
  /** index into the facts array */
  fact: number;
}

const X_MIN = 0.09;
const X_MAX = 0.91;
/** minimum horizontal distance between two spots; the labels lean away from close neighbours */
const MIN_SPACING = 0.115;

function bestSet(cands: Extremum[], count: number, spacing: number): Extremum[] {
  const n = cands.length;
  // dp[k][i]: best total weight choosing k spots with the last one at i
  const dp: number[][] = Array.from({ length: count + 1 }, () => new Array(n).fill(-Infinity));
  const prev: number[][] = Array.from({ length: count + 1 }, () => new Array(n).fill(-1));
  for (let i = 0; i < n; i++) dp[1][i] = cands[i].prominence;
  for (let k = 2; k <= count; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (cands[i].x - cands[j].x < spacing || dp[k - 1][j] === -Infinity) continue;
        const v = dp[k - 1][j] + cands[i].prominence;
        if (v > dp[k][i]) {
          dp[k][i] = v;
          prev[k][i] = j;
        }
      }
    }
  }
  for (let k = count; k >= 1; k--) {
    let best = -1;
    for (let i = 0; i < n; i++) if (dp[k][i] > (best === -1 ? -Infinity : dp[k][best])) best = i;
    if (best === -1) continue;
    const out: Extremum[] = [];
    for (let i = best, kk = k; i !== -1 && kk >= 1; i = prev[kk][i], kk--) out.push(cands[i]);
    return out.reverse();
  }
  return [];
}

/**
 * @param widths relative label widths per fact (e.g. character counts); wide
 *   labels go to the spots with the most room. Fact 0 always takes the summit.
 */
export function pickFactSpots(state: LineState, count: number, widths?: number[]): FactSpot[] {
  const extrema = findExtrema(state, X_MIN, X_MAX).sort((a, b) => a.x - b.x);
  if (extrema.length === 0) return [];

  const summit = extrema.reduce((a, b) => (b.dy < a.dy ? b : a));
  // the summit must be in the set: give it a weight no other combination can beat
  const total = extrema.reduce((s, e) => s + e.prominence, 0);
  const weighted = extrema.map((e) => (e === summit ? { ...e, prominence: total * 10 } : e));

  let chosen: Extremum[] = [];
  for (const spacing of [0.16, 0.14, MIN_SPACING, 0.1, 0.085]) {
    chosen = bestSet(weighted, count, spacing);
    if (chosen.length >= count) break;
  }

  // not enough separated extrema (a long slope): annotate a point in the widest empty stretch
  while (chosen.length < count) {
    const xs = [X_MIN, ...chosen.map((e) => e.x), X_MAX];
    let gapStart = 0;
    let gapWidth = 0;
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] - xs[i - 1] > gapWidth) {
        gapWidth = xs[i] - xs[i - 1];
        gapStart = xs[i - 1];
      }
    }
    const x = gapStart + gapWidth / 2;
    chosen.push({ index: -1, x, dy: dyAtX(state, x), kind: "slope", prominence: 0 });
    chosen.sort((a, b) => a.x - b.x);
  }

  const summitIndex = chosen.findIndex((e) => e.x === summit.x);
  // room per spot: distance to the nearer neighbour, or to the viewport edge
  const room = chosen.map((e, i) => {
    const left = i > 0 ? e.x - chosen[i - 1].x : e.x * 1.4;
    const right = i < chosen.length - 1 ? chosen[i + 1].x - e.x : (1 - e.x) * 1.4;
    return Math.min(left, right);
  });

  const assignment = new Array<number>(chosen.length).fill(-1);
  if (summitIndex >= 0) assignment[summitIndex] = 0;
  const freeFacts = Array.from({ length: count }, (_, i) => i).filter((i) => i !== 0 || summitIndex < 0);
  const byWidth = widths
    ? [...freeFacts].sort((a, b) => (widths[b] ?? 0) - (widths[a] ?? 0))
    : freeFacts;
  const bySpace = chosen
    .map((_, i) => i)
    .filter((i) => i !== summitIndex)
    .sort((a, b) => room[b] - room[a]);
  bySpace.forEach((spotIndex, k) => {
    if (k < byWidth.length) assignment[spotIndex] = byWidth[k];
  });

  return chosen.map((e, i) => ({ x: e.x, dy: e.dy, kind: e.kind, fact: assignment[i] }));
}
