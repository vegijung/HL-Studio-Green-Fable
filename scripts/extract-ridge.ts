/**
 * Ridge extraction for the hero image (BRIEF.md section 6, step 2).
 *
 * For every pixel column, scan from the top and find the first row where the
 * luminance drops clearly below the sky. Median-filter the result, simplify it
 * with Ramer–Douglas–Peucker to about 80 points and save normalised
 * coordinates (0..1 of image width and height) to content/ridge.json.
 * Also writes a debug PNG with the detected ridge drawn in red.
 *
 * usage:
 *   node scripts/extract-ridge.ts <image.png> [options]
 *     --out <file>        default content/ridge.json
 *     --debug <file>      default assets/reference/ridge-debug.png
 *     --contrast <0..1>   how far below the sky a pixel must fall, as a fraction
 *                         of the column's sky-to-dark range. default 0.35
 *     --run <px>          consecutive dark pixels required. default 4 per 1536px of width
 *     --points <n>        target point count after simplification. default 80
 *     --median <px>       median filter window. default 9 per 1536px of width
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

type Point = [number, number];

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const input = process.argv[2];
if (!input || input.startsWith("--")) {
  console.error("usage: node scripts/extract-ridge.ts <image> [--out] [--debug] [--contrast] [--run] [--points] [--median]");
  process.exit(1);
}
const outFile = arg("out", "content/ridge.json");
const debugFile = arg("debug", "assets/reference/ridge-debug.png");
const contrast = Number(arg("contrast", "0.35"));
const targetPoints = Number(arg("points", "80"));

const { data, info } = await sharp(input)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// pixel-based defaults were tuned on a 1536px image; scale them with the width
const scale = Math.max(1, W / 1536);
const minRun = Number(arg("run", String(Math.round(4 * scale))));
const medianWindow = Number(arg("median", String(Math.round(9 * scale) | 1)));
const lum = (x: number, y: number) => data[y * W + x];

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// 1. first dark row per column
const skyRows = Math.max(4, Math.round(H * 0.03));
const raw = new Array<number>(W);
for (let x = 0; x < W; x++) {
  const column: number[] = [];
  for (let y = 0; y < H; y++) column.push(lum(x, y));
  const sky = median(column.slice(0, skyRows));
  const sorted = [...column].sort((a, b) => a - b);
  const dark = sorted[Math.floor(sorted.length * 0.1)];
  const threshold = sky - contrast * (sky - dark);

  let found = H - 1;
  let run = 0;
  for (let y = 0; y < H; y++) {
    if (column[y] < threshold) {
      run++;
      if (run >= minRun) {
        found = y - minRun + 1;
        break;
      }
    } else {
      run = 0;
    }
  }

  // refine to the perceived edge: the row halfway between the sky just above
  // and the rock just below, which matters on soft, hazy edges
  if (found < H - 1) {
    const r = Math.max(1, Math.round(6 * scale));
    const above = median(column.slice(Math.max(0, found - 3 * r), Math.max(1, found - r)));
    const below = median(column.slice(Math.min(H - 1, found + r), Math.min(H, found + 3 * r)));
    const mid = (above + below) / 2;
    for (let y = Math.max(0, found - r); y <= Math.min(H - 1, found + 2 * r); y++) {
      if (column[y] <= mid) {
        found = y;
        break;
      }
    }
  }
  raw[x] = found;
}

// 2. median filter against single-column spikes
const half = Math.floor(medianWindow / 2);
const filtered = raw.map((_, x) => {
  const lo = Math.max(0, x - half);
  const hi = Math.min(W - 1, x + half);
  return median(raw.slice(lo, hi + 1));
});

// 3. Ramer–Douglas–Peucker, epsilon searched so the count lands near the target
function rdp(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist <= epsilon) return [points[0], points[points.length - 1]];
  const left = rdp(points.slice(0, index + 1), epsilon);
  const right = rdp(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
}

const dense: Point[] = filtered.map((y, x) => [x, y]);
let lo = 0;
let hi = H;
let simplified = dense;
for (let i = 0; i < 40; i++) {
  const eps = (lo + hi) / 2;
  const candidate = rdp(dense, eps);
  simplified = candidate;
  if (candidate.length > targetPoints) lo = eps;
  else if (candidate.length < targetPoints * 0.85) hi = eps;
  else break;
}

// 4. write normalised coordinates
const points = simplified.map(([x, y]) => [
  Number((x / (W - 1)).toFixed(4)),
  Number((y / (H - 1)).toFixed(4)),
]);
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    {
      source: path.basename(input),
      width: W,
      height: H,
      params: { contrast, minRun, medianWindow },
      points,
    },
    null,
    2,
  ) + "\n",
);

// 5. debug overlay: raw ridge in red, simplified polyline in cyan with its points
const unit = Math.max(1, W / 1536); // stroke widths scale with image size
const rawPath = filtered.map((y, x) => `${x},${y}`).join(" ");
const simplePath = simplified.map(([x, y]) => `${x},${y}`).join(" ");
const dots = simplified
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${3 * unit}" fill="none" stroke="#00e5ff" stroke-width="${unit}"/>`)
  .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <polyline points="${rawPath}" fill="none" stroke="#ff2020" stroke-width="${2 * unit}"/>
  <polyline points="${simplePath}" fill="none" stroke="#00e5ff" stroke-width="${unit}"/>
  ${dots}
</svg>`;
mkdirSync(path.dirname(debugFile), { recursive: true });
await sharp(input)
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .png()
  .toFile(debugFile);

const summit = simplified.reduce((a, b) => (b[1] < a[1] ? b : a));
console.log(
  `${path.basename(input)}: ${W}x${H}, ${simplified.length} points, summit at x=${(summit[0] / W).toFixed(3)} y=${(summit[1] / H).toFixed(3)}`,
);
console.log(`ridge -> ${outFile}`);
console.log(`debug -> ${debugFile}`);
