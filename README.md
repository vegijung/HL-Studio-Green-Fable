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

The hero photograph is `public/hero/bietschhorn.png` (a generated placeholder until a licensed photo replaces it). Its skyline lives in `content/ridge.json` as normalised coordinates and is projected onto the rendered image through the cover math in `lib/ridge.ts`. Append `?ridge=1` to the home URL to see the ridge drawn over the photo.

To swap the photo, replace the file and re-run the extraction:

```bash
node scripts/extract-ridge.ts public/hero/bietschhorn.png
```

It writes `content/ridge.json` and a debug overlay to `assets/reference/ridge-debug.png`; check that the red line sits on the ridge and tune `--contrast` if it does not. If the new photo's lower third is too bright for the headline, `scripts/prepare-hero.ts` darkens that band deterministically before extraction.

## Phases

See BRIEF.md section 9. Phases 1 (scaffold and static page) and 2 (mountain and ridge) are done; the line engine and icons follow.
