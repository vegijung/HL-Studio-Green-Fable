# HL Studio — website

Marketing site for HL Studio, Brig. The build brief in `BRIEF.md` is the single source of truth; `CLAUDE.md` holds the standing rules for working in this repo.

## Run

```bash
npm install
npm run dev
```

`npm run build` produces the static site, `npm run lint` runs ESLint.

## Where things live

- `content/de.ts` — all German copy, typed by `content/types.ts`. Add `en.ts` and register it in `content/index.ts` for English.
- `content/contact.ts` — contact channels and the primary channel behind "Termin buchen".
- `components/sections/` — the sections of the scroll page in page order.
- `components/` — nav, footer, shared primitives (`Section`, `Container`, `Cta`, `Hairline`).
- `app/` — routes: `/`, `/impressum`, `/datenschutz`, `/leistungen/[slug]`.
- `public/logo/`, `public/team/` — shipped assets. `assets/reference/` is reference material only.

## Hero image and ridge

The hero photograph is `public/hero/bietschhorn.jpg`, a 6336px Gemini render prepared from `assets/hero-variants/bietschhorn-03-4k.jpg`. It is a placeholder until a licensed photo replaces it. Its skyline lives in `content/ridge.json` as normalised coordinates and is projected onto the rendered image through the cover math in `lib/ridge.ts`. Append `?ridge=1` to the home URL to see the ridge drawn over the photo.

To swap the photo, prepare it (optional: darkens the valley band and applies the cold, near-monochrome grade) and re-run the extraction:

```bash
node scripts/prepare-hero.ts path/to/new-photo.jpg public/hero/bietschhorn.jpg
```

```bash
node scripts/extract-ridge.ts public/hero/bietschhorn.jpg
```

The extraction writes `content/ridge.json` and a debug overlay to `assets/reference/ridge-debug.png`; check that the red line sits on the ridge and tune `--contrast` if it does not. The hero reads the file name from `ridge.json`, so both scripts must run on the same file.

## The line

`lib/line/` is the engine from BRIEF.md section 5: `geometry.ts` (resampling, Catmull-Rom, easing), `states.ts` (the 240-point shapes and the thread morph), `engine.ts` (timeline, inertia, colour, text-gap mask), `hero.ts` (opening and lift-off), `facts.ts` (annotation spots). `components/line/LineOverlay.tsx` mounts it on the home page together with Lenis; below 1024px and under reduced motion it stays off and the static hairlines remain.

Every `<Hairline anchor="…">` in a section is a point the line rides through. The line follows an anchor with the content while it crosses the middle band of the viewport and blends to the next one in between; `shape`, `opacity`, `transition` and `pin` on the anchor set what it does there. Text that the line must not cross carries `data-line-gap`.

## Phases

See BRIEF.md section 9. Phases 1 (scaffold and static page), 2 (mountain and ridge) and 3 (line engine) are done; the icons and the polish follow.
