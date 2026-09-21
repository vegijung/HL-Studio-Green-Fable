/**
 * One-off tone adjustment for the hero photograph.
 *
 * The brief wants a dark, calm lower-left third as negative space for the H1.
 * The generated placeholder has pale valley fog there, so this darkens the band
 * below a given height with a short feather, like a valley still in pre-dawn
 * shadow. Deterministic, so a replacement photo can be treated the same way
 * (or skipped if it is already dark enough).
 *
 * usage:
 *   node scripts/prepare-hero.ts <in.png> <out.png> [--from 0.64] [--feather 0.12] [--keep 0.34]
 *     --from     start of the darkened band as a fraction of image height
 *     --feather  height of the transition as a fraction of image height
 *     --keep     brightness multiplier inside the band (0..1)
 */
import sharp from "sharp";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/prepare-hero.ts <in> <out> [--from] [--feather] [--keep]");
  process.exit(1);
}
const from = Number(arg("from", "0.64"));
const feather = Number(arg("feather", "0.12"));
const keep = Number(arg("keep", "0.34"));

const meta = await sharp(input).metadata();
const W = meta.width!;
const H = meta.height!;

// grey mask: white above the band, `keep` inside, smooth (cosine) transition between
const mask = Buffer.alloc(W * H * 3);
const y0 = from * H;
const y1 = (from + feather) * H;
for (let y = 0; y < H; y++) {
  let factor = 1;
  if (y >= y1) factor = keep;
  else if (y > y0) {
    const t = (y - y0) / (y1 - y0);
    factor = 1 - (1 - keep) * (0.5 - 0.5 * Math.cos(Math.PI * t));
  }
  const v = Math.round(factor * 255);
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    mask[i] = v;
    mask[i + 1] = v;
    mask[i + 2] = v;
  }
}

await sharp(input)
  .composite([
    {
      input: mask,
      raw: { width: W, height: H, channels: 3 },
      blend: "multiply",
    },
  ])
  .png()
  .toFile(output);

console.log(`${input} -> ${output} (band from ${from} with ${feather} feather, keep ${keep})`);
