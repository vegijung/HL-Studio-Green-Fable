# HL Studio website

Read `BRIEF.md` completely before doing anything. It is the single source of truth for design, copy, tech and process.

## Rules for this repo
- Work in the phases from BRIEF.md section 9. Stop after each phase and wait for review.
- The three hard rules in BRIEF.md section 2 override everything else.
- All copy lives in `content/de.ts`. Never hardcode German text in components.
- Swiss orthography: "ss" not "ß", numbers as CHF 1'000.
- No new dependencies beyond those named in BRIEF.md section 4 without asking.

## Setup notes
- This folder is not empty, so `create-next-app` will refuse to run in place. Scaffold into `./_scaffold` (App Router, TypeScript, Tailwind, ESLint, no `src/` dir), move its contents to the repo root, delete `_scaffold`.
- Then move `assets/logo/*` to `public/logo/` and `assets/team/*` to `public/team/`, and copy `assets/logo/favicon.svg` to `app/icon.svg`. Keep `assets/reference/` where it is; it is reference material, not shipped.
- The hero image does not exist yet. It is generated in phase 2 with the Gemini MCP server. If that server is not available in this session, say so and stop; do not substitute a stock photo.
- Initialise git on the first run and commit at the end of every phase.
