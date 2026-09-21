/**
 * Deterministic tone preparation for the hero photograph.
 *
 * Two things the brief asks of the photo that a generated image may not bring:
 *   1. a dark, calm lower-left third as negative space for the H1
 *      -> darken the band below a given height with a smooth feather
 *   2. muted, almost monochrome, cold green-black tones
 *      -> reduce saturation and mix in a cold tint
 * Both are optional and repeatable, so a replacement photo can get the same
 * treatment (or none, if it already fits).
 *
 * usage:
 *   node scripts/prepare-hero.ts <in> <out.jpg|out.png> [options]
 *     --from <0..1>       start of the darkened band, fraction of height. default 0.58
 *     --feather <0..1>    height of the transition, fraction of height. default 0.22
 *     --keep <0..1>       brightness multiplier inside the band. default 0.32
 *     --saturation <n>    saturation multiplier before tinting. default 0.6
 *     --tint <hex>        cold tint colour. default 6f7d75
 *     --tint-mix <0..1>   how much of the tinted version to mix in. default 0.45
 *     --quality <n>       JPEG quality when the output is .jpg. default 90
 */
import path from "node:path";
import sharp from "sharp";

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/prepare-hero.ts <in> <out> [--from] [--feather] [--keep] [--saturation] [--tint] [--tint-mix] [--quality]");
  process.exit(1);
}
const from = Number(arg("from", "0.58"));
const feather = Number(arg("feather", "0.22"));
const keep = Number(arg("keep", "0.32"));
const saturation = Number(arg("saturation", "0.6"));
const tint = arg("tint", "6f7d75");
const tintMix = Number(arg("tint-mix", "0.45"));
const quality = Number(arg("quality", "90"));

const meta = await sharp(input).metadata();
const W = meta.width!;
const H = meta.height!;

// 1. colour: desaturate, then blend a tinted (luminance-only) copy on top
const base = await sharp(input).modulate({ saturation }).removeAlpha().toBuffer();
const tinted = await sharp(base)
  .tint(`#${tint}`)
  .ensureAlpha(tintMix)
  .png()
  .toBuffer();
const graded = await sharp(base).composite([{ input: tinted, blend: "over" }]).toBuffer();

// 2. valley band: grey mask, white above, `keep` inside, cosine transition between
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
  mask.fill(v, y * W * 3, (y + 1) * W * 3);
}

let pipeline = sharp(graded).composite([
  { input: mask, raw: { width: W, height: H, channels: 3 }, blend: "multiply" },
]);
pipeline =
  path.extname(output).toLowerCase() === ".png"
    ? pipeline.png()
    : pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" });
await pipeline.toFile(output);

console.log(
  `${input} -> ${output} (${W}x${H}; band from ${from}, feather ${feather}, keep ${keep}; saturation ${saturation}, tint #${tint} x ${tintMix})`,
);
