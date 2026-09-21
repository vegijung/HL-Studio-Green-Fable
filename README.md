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

## Phases

See BRIEF.md section 9. Phase 1 (scaffold and static page) is done; the line engine, hero image and icons follow.
