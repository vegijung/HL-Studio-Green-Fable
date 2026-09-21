/**
 * Pure geometry for the line engine: resampling, smoothing, easing.
 * Everything here is viewport-agnostic and has no DOM access.
 */

export type Pt = [number, number];

/** every line state has exactly this many points, in the same order */
export const N = 240;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** GSAP's power2.inOut */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** GSAP's power2.out */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** clips a polyline that is monotonic in x to [xMin, xMax], interpolating at the borders */
export function clipPolylineX(poly: Pt[], xMin: number, xMax: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const inside = p[0] >= xMin && p[0] <= xMax;
    if (i > 0) {
      const q = poly[i - 1];
      for (const edge of [xMin, xMax]) {
        if ((q[0] - edge) * (p[0] - edge) < 0) {
          const t = (edge - q[0]) / (p[0] - q[0]);
          out.push([edge, lerp(q[1], p[1], t)]);
        }
      }
    }
    if (inside) out.push(p);
  }
  return out;
}

/** resamples a polyline into n points spaced evenly by arc length */
export function resampleByArcLength(poly: Pt[], n: number): Pt[] {
  if (poly.length < 2) return Array.from({ length: n }, () => [...(poly[0] ?? [0, 0])] as Pt);
  const cum = [0];
  for (let i = 1; i < poly.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const out: Pt[] = [];
  let seg = 0;
  for (let k = 0; k < n; k++) {
    const d = (total * k) / (n - 1);
    while (seg < poly.length - 2 && cum[seg + 1] < d) seg++;
    const segLen = cum[seg + 1] - cum[seg] || 1;
    const t = clamp((d - cum[seg]) / segLen);
    out.push([lerp(poly[seg][0], poly[seg + 1][0], t), lerp(poly[seg][1], poly[seg + 1][1], t)]);
  }
  return out;
}

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

/**
 * Catmull-Rom spline through the points, emitted as cubic Béziers.
 * Uniform parametrisation is fine because the points are evenly spaced by arc
 * length. `tension` pulls the control points toward the vertices (0 = classic
 * Catmull-Rom, 1 = straight segments); a little keeps sharp peaks sharp.
 */
export function catmullRomPath(xs: ArrayLike<number>, ys: ArrayLike<number>, tension = 0.4): string {
  const n = xs.length;
  if (n < 2) return "";
  const k = (1 - tension) / 6;
  let d = `M${f1(xs[0])} ${f1(ys[0])}`;
  for (let i = 0; i < n - 1; i++) {
    const i0 = Math.max(i - 1, 0);
    const i3 = Math.min(i + 2, n - 1);
    const c1x = xs[i] + (xs[i + 1] - xs[i0]) * k;
    const c1y = ys[i] + (ys[i + 1] - ys[i0]) * k;
    const c2x = xs[i + 1] - (xs[i3] - xs[i]) * k;
    const c2y = ys[i + 1] - (ys[i3] - ys[i]) * k;
    d += `C${f1(c1x)} ${f1(c1y)} ${f1(c2x)} ${f1(c2y)} ${f1(xs[i + 1])} ${f1(ys[i + 1])}`;
  }
  return d;
}
