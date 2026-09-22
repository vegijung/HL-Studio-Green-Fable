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

`lib/line/` is the engine from BRIEF.md section 5: `geometry.ts` (resampling, Catmull-Rom, easing), `states.ts` (the 240-point shapes and the thread morph), `icons.ts` (the four one-stroke icons and the stage partition), `engine.ts` (timeline, inertia, colour, text-gap mask), `hero.ts` (opening and lift-off), `facts.ts` (annotation spots). `components/line/LineOverlay.tsx` mounts it on the home page together with Lenis (the drawing is sized to the layout viewport without the scrollbar, so it is 1:1 with the page); below 1024px and under reduced motion it stays off and the static hairlines remain.

The page has three kinds of nodes for the line:

- **hero**: the ridge, registered on the photo at scroll 0.
- **anchor**: a `<Hairline anchor="...">` the line rides through with the content while it crosses the middle band of the viewport (facts, contact). `shape`, `opacity`, `transition`, `pin`, `pinShape` and `release` on the anchor set what it does there; after a pin the flat line keeps riding with the content until the anchor reaches `release`.
- **stage**: the fixed box on the right third of the viewport (`[data-line-stage]` in `app/page.tsx`). From the services section on, the thread contracts into a short segment there and is pulled into one icon after another as the chapters pass (the programme in `engine.ts`): a browser window with a landscape in it, a cycle with two arrowheads, a ticked-off sheet, a light bulb. Each is one continuous polyline in `icons.ts`; where a shape needs a second pass, the thread runs back exactly along a line already drawn, and the samples are snapped onto the polyline's vertices so corners stay crisp. The content of those sections stays in the left two thirds (`<Section narrow>`), so the line never crosses text. Every stage shape uses the same point partition, so an icon change is a true morph: the thread settles into the segment and rises into the next icon, the change travelling along the stroke. After the last icon the photograph comes back in a window on the stage (`[data-line-stage-photo]`) and the thread takes the ridge of that crop; from cases to team the crop pans slowly across the picture (`data-line-stage-photo-pan`, from the summit on the left to the ridges on the right) and the line is recomputed every frame, so peaks enter on the right and leave on the left.
- **photo**: the closing (`[data-line-photo]` in `Contact.tsx`) is the photograph at full viewport again. On the way in, the stage window grows into that box while the line is always the ridge of whatever the window shows, so it stretches to the full width as the picture does; at the top the window hands over to the picture in the flow (`--photo-show`) and the line rides it to the end. The copy on both photographs starts below the ridge's lowest left point (`--ridge-clear`, set by the engine).

Text that the line must not cross elsewhere carries `data-line-gap`.
## Phases

See BRIEF.md section 9. Phases 1 (scaffold and static page), 2 (mountain and ridge), 3 (line engine) and 4 (icons on the stage) are done; the polish follows.
