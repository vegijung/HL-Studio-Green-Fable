/**
 * The four one-stroke icons (BRIEF.md section 5, point 7).
 *
 * Each icon is one stroke in a unit box (x and y from 0 to 1, y down, z
 * toward the viewer): a wire sculpture. Projected onto the stage it is still
 * one polyline: the thread enters at the bottom-left corner (0,1) on the
 * baseline, draws the shape without lifting, and exits at the bottom-right
 * corner (1,1). Where a shape cannot be drawn in one pass, the thread runs
 * back exactly along a line it has already drawn, which stays invisible.
 */
import { N, resampleByArcLength, type Pt } from "./geometry";
import { emptyState, type LineState } from "./states";

export type IconName = "browser" | "loops" | "sheet" | "bubble";

/** a point in the icon's box: x and y as before, z toward the viewer (positive = nearer) */
export type Pt3 = [number, number, number];

const DEG = Math.PI / 180;

/** a point on a horizontal circle around the vertical axis through x = 0.5: angle 180 is the left silhouette, 0 the right */
const onHoop = (y: number, r: number, deg: number): Pt3 => [0.5 + r * Math.cos(deg * DEG), y, r * Math.sin(deg * DEG)];

/** points along a horizontal circle from one angle to another (inclusive) */
function hoopArc(y: number, r: number, fromDeg: number, toDeg: number, steps: number): Pt3[] {
  const out: Pt3[] = [];
  for (let i = 0; i <= steps; i++) out.push(onHoop(y, r, fromDeg + ((toDeg - fromDeg) * i) / steps));
  return out;
}

/**
 * A wire surface of revolution drawn as one stroke. `profile` lists the
 * levels from the bottom up as [y, radius]; each level gets a full parallel
 * (a hoop) and the levels are joined by `meridians` vertical curves. The
 * thread climbs the left meridian drawing every parallel on the way, then
 * runs down and up the other meridians in turn, moving between them along
 * parallels already drawn (invisible retraces), and ends at the bottom on
 * the right silhouette. Requires an even number of meridians.
 */
function lathe(profile: [number, number][], meridians: number, ringSteps: number): Pt3[] {
  const L = profile.length - 1;
  const angle = (j: number) => 180 + (360 * j) / meridians;
  const P = (i: number, deg: number) => onHoop(profile[i][0], profile[i][1], deg);
  // the thread enters and leaves through the base's centre, the one point no turn or pitch moves, so the baseline stays straight
  const centre: Pt3 = [0.5, profile[0][0], 0];
  const body: Pt3[] = [centre];
  // up the first meridian, a parallel at every level
  for (let i = 0; i <= L; i++) {
    if (profile[i][1] > 0.005) body.push(...hoopArc(profile[i][0], profile[i][1], 180, 540, ringSteps));
    else body.push(P(i, 180));
  }
  // the other meridians, down and up alternately
  for (let j = 1; j < meridians; j++) {
    const down = j % 2 === 1;
    const level = down ? L : 0;
    // step over to the next meridian along the parallel at this level
    body.push(...hoopArc(profile[level][0], profile[level][1], angle(j - 1), angle(j), 4).slice(1));
    if (down) for (let i = L - 1; i >= 0; i--) body.push(P(i, angle(j)));
    else for (let i = 1; i <= L; i++) body.push(P(i, angle(j)));
  }
  // along the bottom parallel to the right silhouette, then in to the centre
  body.push(...hoopArc(profile[0][0], profile[0][1], angle(meridians - 1), 360, 4).slice(1), centre);
  return body;
}

/**
 * A wire grid drawn as one stroke: every row, then every column, snaking
 * back and forth and moving between them along lines already drawn. Starts
 * at grid[0][0] and ends at grid[0][last] when the column count is odd.
 */
function gridStroke(grid: Pt3[][]): Pt3[] {
  const R = grid.length;
  const C = grid[0].length;
  const body: Pt3[] = [];
  for (let r = 0; r < R; r++) {
    const cols = r % 2 === 0 ? [...Array(C).keys()] : [...Array(C).keys()].reverse();
    for (const col of cols) body.push(grid[r][col]);
  }
  // the rows ended at row R-1, column 0 (R even) or C-1 (R odd); the columns start there
  let col = R % 2 === 0 ? 0 : C - 1;
  const step = col === 0 ? 1 : -1;
  for (let k = 0; k < C; k++) {
    const goingDown = k % 2 === 0;
    const rows = goingDown ? [...Array(R).keys()].reverse() : [...Array(R).keys()];
    for (const r of rows.slice(1)) body.push(grid[r][col]);
    if (k < C - 1) {
      col += step;
      body.push(grid[goingDown ? 0 : R - 1][col]);
    }
  }
  return body;
}

/**
 * Websites & Marketing: the browser window as a slab with a wire mountain
 * landscape receding into the screen. The stroke draws the front frame with
 * an edge to the back at every point, the title bar, the terrain mesh, the
 * back frame, and leaves through the base's centre.
 */
const browser: Pt3[] = (() => {
  const l = 0.06;
  const r = 0.94;
  const top = 0.18;
  const rad = 0.09;
  const bar = 0.36;
  const d = 0.11;
  const bottom = 1;
  // the frame's outline, densely sampled, clockwise from the bottom-left corner
  const outline: [number, number][] = [];
  const line = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) outline.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  };
  const corner = (cx: number, cy: number, from: number, to: number) => {
    for (let i = 0; i < 6; i++) {
      const a = (from + ((to - from) * i) / 6) * DEG;
      outline.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
    }
  };
  line(l, bottom, l, top + rad, 8);
  corner(l + rad, top + rad, 180, 270);
  line(l + rad, top, r - rad, top, 10);
  corner(r - rad, top + rad, 270, 360);
  line(r, top + rad, r, bottom, 8);
  line(r, bottom, l, bottom, 10);
  const body: Pt3[] = [[0.5, bottom, 0]];
  for (const [x, y] of outline) body.push([x, y, d], [x, y, -d], [x, y, d]);
  body.push([l, bottom, d]);
  // the title bar, up the left edge and across
  body.push([l, bar, d], [r, bar, d], [r, bottom, d]);
  // the terrain: rows recede into the screen, ridges rise from the screen's floor
  const tl = l + 0.08;
  const tr = r - 0.08;
  const cols = 9;
  const rows = 5;
  const near = [0.1, 0.3, 0.55, 0.95, 0.6, 0.4, 0.7, 0.35, 0.12];
  const far = [0.3, 0.6, 0.85, 0.5, 0.75, 1, 0.55, 0.65, 0.4];
  const grid: Pt3[][] = [];
  for (let rr = 0; rr < rows; rr++) {
    const t = rr / (rows - 1);
    const row: Pt3[] = [];
    for (let cc = 0; cc < cols; cc++) {
      const x = tr - ((tr - tl) * cc) / (cols - 1); // from the right, so the mesh starts where the bar ended
      const h = near[cc] * (1 - t) + far[cc] * t;
      row.push([x, bottom - 0.04 - h * (0.22 + 0.18 * t), d - 0.02 - t * 0.42]);
    }
    grid.push(row);
  }
  body.push(...gridStroke(grid));
  // the mesh ends at its front-left; along the bottom to the corner, the back frame, and out through the centre
  body.push([l, bottom, d], [l, bottom, -d]);
  for (const [x, y] of outline.slice(1)) body.push([x, y, -d]);
  body.push([l, bottom, -d], [l, bottom, d], [0.5, bottom, 0]);
  return body;
})();

/**
 * Backoffice: the sheet as a wire grid with its corner folded up toward the
 * viewer, and the tick floating just above the page. The stroke runs the
 * grid, climbs the middle column to the tick, draws it, and drops back to
 * the base's centre.
 */
const sheet: Pt3[] = (() => {
  const l = 0.2;
  const r = 0.8;
  const top = 0.04;
  const f = 0.16;
  const cols = 9;
  const rows = 10;
  const grid: Pt3[][] = [];
  for (let rr = 0; rr < rows; rr++) {
    const row: Pt3[] = [];
    for (let cc = 0; cc < cols; cc++) {
      const x = l + ((r - l) * cc) / (cols - 1);
      const y = 1 - ((1 - top) * rr) / (rows - 1);
      // beyond the fold's diagonal the corner is folded over: mirrored across it and lifted
      const over = x - (r - f) - (y - top);
      if (over > 0) row.push([r - f + (y - top), top + (x - (r - f)), 0.06 + over * 0.5]);
      else row.push([x, y, 0]);
    }
    grid.push(row);
  }
  const mid = grid[0][Math.floor(cols / 2)][0];
  const z = 0.08;
  return [
    [0.5, 1, 0],
    ...gridStroke(grid), // ends at the bottom-right corner
    [mid, 1, 0],
    [mid, 0.76, 0],
    [mid, 0.76, z],
    [0.36, 0.62, z], // the tick's short stroke
    [mid, 0.76, z],
    [0.74, 0.42, z], // and the long one
    [mid, 0.76, z],
    [mid, 0.76, 0],
    [mid, 1, 0],
    [0.5, 1, 0],
  ];
})();
/**
 * Automationen: a gear with thickness and a hub. The stroke runs round the
 * front outline and at every corner dips to the back face and returns, then
 * steps back once and runs round the back outline, so the wheel has edges
 * on all its teeth; the hub is a short tube through the middle.
 */
const gear: Pt3[] = (() => {
  const cx = 0.5;
  const outer = 0.4;
  const root = 0.31;
  const hub = 0.11;
  const cy = 1 - outer;
  const teeth = 9;
  const pitch = 360 / teeth;
  const tip = pitch * 0.36;
  const gap = pitch * 0.36;
  const flank = (pitch - tip - gap) / 2;
  const h = 0.09;
  const at = (deg: number, r: number, z: number): Pt3 => [cx + r * Math.cos(deg * DEG), cy + r * Math.sin(deg * DEG), z];
  // the outline as a closed loop starting at the bottom tooth's left corner
  const start = 90 + tip / 2;
  const loop: [number, number][] = [[start, outer]];
  for (let k = 0; k < teeth; k++) {
    const a = start - k * pitch;
    loop.push([a - tip, outer], [a - tip - flank, root], [a - tip - flank - gap, root], [a - pitch, outer]);
  }
  const body: Pt3[] = [[0.5, 1, 0]];
  // front outline with an edge to the back at every corner
  for (const [deg, r] of loop) body.push(at(deg, r, h), at(deg, r, -h), at(deg, r, h));
  // the hub: from the bottom tooth's corner in to the front hub circle, round it, through to the back circle, round it, and back out
  const hubIn = 90 + tip / 2;
  body.push(at(hubIn, hub, h));
  for (let i = 1; i <= 20; i++) body.push(at(hubIn + (360 * i) / 20, hub, h));
  body.push(at(hubIn, hub, -h));
  for (let i = 1; i <= 20; i++) body.push(at(hubIn + (360 * i) / 20, hub, -h));
  body.push(at(hubIn, hub, h), at(start, outer, h));
  // the back outline: step back at the start corner, round, and forward again
  body.push(at(start, outer, -h));
  for (const [deg, r] of loop.slice(1)) body.push(at(deg, r, -h));
  body.push(at(start, outer, h), [0.5, 1, 0]);
  return body;
})();

/**
 * Beratung & Schulung: a light bulb as one lathe from the screw base up:
 * the base's threads, the flare of the neck and the glass closing to a pole.
 */
const bulb: Pt3[] = lathe(
  [
    [1, 0.12],
    [0.95, 0.12],
    [0.9, 0.12],
    [0.85, 0.12],
    [0.8, 0.13],
    [0.74, 0.17],
    [0.66, 0.24],
    [0.56, 0.29],
    [0.46, 0.31],
    [0.36, 0.3],
    [0.26, 0.26],
    [0.17, 0.19],
    [0.1, 0.1],
    [0.06, 0],
  ],
  8,
  20,
);
/** the four sculptures: the stroke's body between the entry (0,1) and the exit (1,1) on the baseline */
export const ICONS_3D: Record<IconName, Pt3[]> = { browser, loops: gear, sheet, bubble: bulb };

/** the resting turn (radians, about the vertical axis) and the pitch (about the baseline) that give the sculptures depth even when still */
export const REST_TURN = -0.4;
export const PITCH = 0.38;
/** perspective: points nearer the viewer grow by this much per unit of depth */
const PERSPECTIVE = 0.3;

/**
 * Projects a sculpture onto the stage's plane as one polyline entering at
 * (0,1) and leaving at (1,1). It turns by `turn` about the vertical axis
 * through the box's centre, pitches by PITCH about the baseline, and gets a
 * little perspective; the base's centre point stays put, so the thread always
 * enters and leaves where the segment expects it.
 */
export function projectIcon(name: IconName, turn: number): Pt[] {
  const ct = Math.cos(turn);
  const st = Math.sin(turn);
  const cp = Math.cos(PITCH);
  const sp = Math.sin(PITCH);
  const out: Pt[] = [[0, 1]];
  for (const [x, y, z] of ICONS_3D[name]) {
    // turn about the vertical axis through (0.5, *, 0)
    const dx = x - 0.5;
    const x1 = dx * ct + z * st;
    const z1 = -dx * st + z * ct;
    // pitch about the baseline (y = 1): the top tips away, hoops open up
    const dy = y - 1;
    const y2 = 1 + dy * cp + z1 * sp;
    const z2 = -dy * sp + z1 * cp;
    const f = 1 / (1 - z2 * PERSPECTIVE);
    out.push([0.5 + x1 * f, 1 + (y2 - 1) * f]);
  }
  out.push([1, 1]);
  return out;
}
/** the sculptures at rest, as flat polylines (stills, the hover, and any code that wants a fixed shape) */
export const ICONS: Record<IconName, Pt[]> = {
  browser: projectIcon("browser", REST_TURN),
  loops: projectIcon("loops", REST_TURN),
  sheet: projectIcon("sheet", REST_TURN),
  bubble: projectIcon("bubble", REST_TURN),
};

/** the icon each service (by slug and section id) is drawn with */
export const ICON_FOR_SERVICE: Record<string, IconName> = {
  websites: "browser",
  automationen: "loops",
  backoffice: "sheet",
  "beratung-schulung": "bubble",
};

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
export const STAGE_PARTITION: Partition = { left: 30, icon: N - 60, right: 30 };

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
