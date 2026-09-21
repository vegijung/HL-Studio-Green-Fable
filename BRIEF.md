# HL Studio — Website Build Brief (for Claude Code)

You are building the marketing website for **HL Studio**, a two-person AI and automation studio in Brig, Oberwallis (Switzerland). Audience: owners of small local businesses (hotels, trades, fiduciaries). Primary goal of the site: get them to book a first conversation, with **websites as the entry offer**.

Work in the phases defined in section 9. **Stop after each phase and wait for my review.** Do not start the line animation before the static page is approved.

---

## 1. The idea in five sentences

One continuous line begins as the ridge of an Oberwallis mountain. It detaches from the hero photograph, carries a few key facts along its peaks, then flattens into a straight line. Through the services it is pulled, like a thread on a table, into one small icon per service and released again. It goes quiet for cases, prices and team. At the end it rises back into the original ridge, above the contact section.

Narrative: **mountain → line → work → mountain.** Never explained in copy.

## 2. The three hard rules

1. **Content > composition > line.** Every section must work with the line removed. If the line draws more attention than a headline, it is too strong. Nothing readable ever waits for an animation.
2. **One line.** A single SVG path, from first to last pixel of the page. It never fades out and reappears elsewhere, never gets replaced by a second path, never crossfades between shapes. It genuinely morphs.
3. **The line never crosses text.** It passes behind it like a contour line on a Swiss topo map breaking for an elevation number: line → clean gap → text → clean gap → line.

## 3. Look and feel

Visual reference: `assets/reference/brand-board.png`. Take palette, type pairing and mood from it. Ignore its English marketing copy and its heavy use of contour lines; this brief overrides it.

Swiss editorial, calm, precise. Closer to an architecture studio or strategy boutique than to an AI startup. Typography, whitespace and one photograph do the work.

**Motion calibration.** The principle I want is the one used on drone.riotters.com: *one persistent object, driven by scroll, accompanies the whole page while the sections stay readable.* Here the object is a 1.5px line, not a 3D model, so the result is far quieter. Negative reference: unbelievablycrap.com, far too much movement. No bounce, no elastic easing, no particles, no parallax beyond the hero, no scroll-jacking. Native scroll stays in the user's control.

**Not allowed:** gradients, glow, glassmorphism, 3D objects, robots/brains/circuits, rounded SaaS cards, icon-library icons, dashboards, stock tourism imagery, contour lines as wallpaper.

### Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--ivory` | `#F7F5EF` | main surface |
| `--charcoal` | `#1A1A1A` | text, dark surfaces |
| `--fog` | `#D6D6D1` | hairlines, secondary graphics |
| `--forest` | `#2E4B3F` | the line on light surfaces, primary CTA, one accent phrase per section at most |

Surface sequence: **dark opening and hero → ivory for everything in between → dark closing** (charcoal with a slight forest tint). The page begins and ends in the same light. The line is ivory on dark, forest on ivory, and changes colour across the boundary via scroll progress, not by swapping elements.

### Type

Free fonts via `next/font/google`: **Playfair Display** (display serif, headlines and large numerals, weight 400–500, tight tracking) and **Inter** (everything else). Labels: Inter, uppercase, 11–12px, letter-spacing 0.14em. Large type is used selectively: hero H1, fact numerals, service names, closing statement. Body 17–18px, max line length 62ch.

### Layout

12-column grid, 1440 design width, max content width 1280, generous vertical rhythm (section padding 160–220px desktop). Hairlines in fog instead of boxes. No cards anywhere, including prices.

---

## 4. Tech

- **Next.js (App Router, TypeScript), Tailwind CSS, deployed on Vercel.**
- **GSAP + ScrollTrigger** (free) for scroll progress. **Lenis** for subtle scroll smoothing (lerp ~0.1), native scrollbar kept. No other animation libraries, no Three.js.
- All copy in `content/de.ts` (typed object). No CMS. Structure it so `en.ts` can be added next (German and English are the only planned site languages for now; keep the structure open for more).
- Contact config in `content/contact.ts` with `primaryChannel: 'whatsapp' | 'email' | 'phone'` and placeholder values. The CTA component reads from it. Channel is not decided yet.
- Routes: `/` (the scroll page), `/impressum`, `/datenschutz` (placeholder text), and empty-but-routed `/leistungen/[slug]` for the four services, for later SEO pages. Subpages get a static, non-animated version of the line as a header rule.
- Lighthouse performance ≥ 90 desktop. Hero image via `next/image`, AVIF/WebP, priority.
- `prefers-reduced-motion`: the line is rendered static per section (ridge in hero, straight elsewhere, icons already formed, ridge at the end). No scroll-linked morphing.
- **Desktop first (≥1024px).** Below that, for now: the line is a simple static rule between sections and icons are shown pre-formed. Build the layout responsively, but do not choreograph mobile yet. Keep the line engine viewport-agnostic (normalised coordinates) so a mobile choreography can be added later.

---

## 5. The line engine (read carefully, this is the hard part)

**Do not use path-morph plugins or crossfades.** Build a small engine:

1. One `<svg>` overlay, `position: fixed`, full viewport, `pointer-events: none`, z-index **below** text and **above** backgrounds and the hero image. One `<path>`, stroke 1.5px, round joins, no fill.
2. The path is always defined by **N = 240 points**. Every *state* (ridge, facts-ridge, straight, icon-website, icon-automation, icon-backoffice, icon-schulung, ridge-return) is an array of exactly 240 points in normalised viewport coordinates, produced by resampling a source shape by arc length. Because every state has the same point count in the same order, interpolation between any two states is a true morph.
3. A **timeline** maps page scroll progress to `(stateA, stateB, t)` plus a vertical offset and colour. Drive it from ScrollTrigger scrub values tied to section elements, not to hardcoded pixel offsets.
4. **Thread feel:** do not interpolate all points with the same `t`. Give each point a small delay based on its x-position (`t_i = clamp(t * 1.4 − x_i * 0.4)`), so a shape forms as tension travelling along the thread from left to right, and releases the same way. Ease: `power2.inOut` at most.
5. **Inertia:** the rendered progress lerps toward the scroll progress (factor ~0.08 per frame). Fast scrolling makes the line lag slightly and settle. Never more than ~300ms behind.
6. Render the points as a smooth path (Catmull-Rom → cubic Bézier) each frame in one `requestAnimationFrame` loop. Only update `d` when progress changed.
7. **Icons must be one-stroke drawings:** the thread enters from the left at baseline, forms the shape, exits to the right at baseline. Retracing a segment is allowed; lifting the pen is not. The icon occupies roughly 120×120px; the rest of the 240 points stay on the baseline.
8. **Text gaps:** any element with `data-line-gap` registers its bounding box (+14px padding) with the engine. The engine writes these boxes into an SVG `<mask>` as black rects, so the line is cut cleanly around them. Recompute on resize and on scroll (boxes are in viewport space). This must also work over the hero photo, which is why it is a mask and not a background-coloured text plate.

### Line choreography by section

| # | Section | Line state | Notes |
|---|---|---|---|
| 0 | Opening | ridge, draws in left→right (~0.9s, `stroke-dashoffset`) | dark surface, line ivory. Skippable: any scroll completes it instantly. H1 is already in the DOM and fades up at 0.6s. |
| 1 | Hero | ridge, locked to the photo's real ridge | photo fades in under the line. Pixel-accurate registration is mandatory, see 6. |
| 2 | Hero → Facts | ridge lifts off the photo | photo fades and scales down 3–4% while the line keeps its shape and drifts down to mid-viewport. Surface turns ivory, line turns forest. |
| 3 | Facts | ridge, horizontally stretched ~1.3× | six facts annotated at peaks and saddles with short fog leader lines, like a geographic section drawing. Ridge drifts slowly upward through the viewport while scrolling. |
| 4 | Facts → Services | ridge flattens to straight | peaks relax from the outside in. Pinned for max 60vh of scroll. This is the only pin besides the hero. |
| 5 | Services overview | straight, quiet, at 60% opacity | runs under the four service names. |
| 6–9 | Four service chapters | straight → icon → straight, once per chapter | icon forms when the chapter's headline passes 60% viewport height, releases when it passes 15%. Icon sits beside the label, never beside body copy. |
| 10 | Cases | straight, 40% opacity | becomes the horizontal axis of the before → after figures. No morphing here. |
| 11 | Prices | straight, 40% opacity | acts as the rule above the price columns. |
| 12 | Team | straight, baseline under the two portraits | first low swells appear toward the end of the section. |
| 13 | Return → Contact | straight → ridge-return (identical to state 1) | surface turns dark, line turns ivory. Ridge sits in the upper third, closing statement below it. |

The four icons, in rising then falling complexity so not every one is equally loud:

- **Websites:** a browser window. Rectangle drawn clockwise, one short inner stroke for the address bar.
- **Automationen:** two interlocking loops, the thread feeding back into itself.
- **Backoffice:** a sheet of paper with a folded corner.
- **Beratung & Schulung:** a speech bubble with a small tail. The simplest of the four.

---

## 6. The mountain and the ridge (asset pipeline)

**Mountain: Bietschhorn**, seen from the Rhône valley side. It is the landmark of the Visp/Brig region, a clean pyramid with one dominant ridge, and it is not tourist-poster material like the Matterhorn.

1. Generate the hero image with the **Gemini MCP**. Prompt direction: *"Bietschhorn, Valais, seen from the south-west at dawn. One dominant pyramid ridge left of centre, secondary peaks receding into layered haze on the right. Low cloud in the valleys. Muted, almost monochrome, deep charcoal and cold green-black tones, pale even sky with no clouds touching the ridge. Quiet, architectural, documentary. Dark, calm lower-left third as negative space for typography. No people, no buildings, no lens flare, no saturated colours, no HDR. 21:9, highest resolution available."* Generate 4 variants, show me, I choose.
   The clean pale sky is a technical requirement: it makes step 2 reliable.
2. Write `scripts/extract-ridge.ts` (using `sharp`): for every pixel column, scan from the top and find the first row where luminance falls below a threshold relative to the sky. Median-filter the result, simplify with Ramer–Douglas–Peucker to ~80 points, save as normalised coordinates to `content/ridge.json`. Also write a debug PNG with the detected ridge drawn in red over the photo. **Look at the debug image yourself and fix the threshold until the red line sits on the ridge.** Show it to me.
3. In the hero, the image uses `object-fit: cover`. Transform the normalised ridge points through the **same cover math** (scale + offset for the current viewport) so the line sits on the photographed ridge at every desktop aspect ratio. Recompute on resize.
4. The image is a placeholder for a real licensed photograph later. Swapping it must only require replacing the file and re-running the script.

Ambient contour lines: at most **one** place on the whole page, as a very faint fog-coloured texture inside the dark closing section. Not in the hero, not behind services.

**Logo:** provided in `assets/logo/` (move to `public/logo/` in phase 1): `hl-studio-logo-horizontal.svg`, `hl-studio-logo-stacked.svg`, `hl-monogram.svg` (all `currentColor`) and `favicon.svg`. Horizontal in the nav at 28px height, stacked in the footer, `favicon.svg` as `app/icon.svg`.

**Portraits:** provided in `assets/team/` (move to `public/team/` in phase 1) as `janis.png` and `raphael.png`, on white. Render them greyscale with `mix-blend-mode: multiply` on the ivory surface so the white disappears and they sit in the page rather than in a box. No frames, no circles, no hover effects.

---

## 7. Page structure and copy (German, informal "du")

Use this copy verbatim unless marked. Swiss orthography (ss, not ß; CHF 1'000).

**Meta title:** HL Studio — KI-Agentur im Oberwallis
**Meta description:** Websites, Automationen und Backoffice für Unternehmen im Oberwallis. In Tagen statt Monaten, zum Fixpreis.
**Nav:** Leistungen · Cases · Preise · Team · [Termin buchen]
Nav is transparent over the hero, ivory with a fog hairline after it. Logo left.

### 0–1 Opening + Hero
Label (appears with the ridge, stays): `KI-AGENTUR · OBERWALLIS`
**H1:** Digitale Werkzeuge für dein Unternehmen. In Tagen, nicht Monaten.
**Sub:** HL Studio baut Websites, Automationen und Backoffice-Lösungen für Betriebe im Oberwallis. Agenturqualität zum Fixpreis, weil wir mit den Werkzeugen von heute bauen statt mit Stundenbudgets.
**CTAs:** [Termin buchen →] (forest, solid) · Leistungen ansehen (text link)
Bottom right, small, serif italic: *KI fer es fortgschrittus moro.* ← Walliser dialect tagline. Keep the spelling exactly.

### 3 Facts along the ridge
No section headline. Six annotations, numeral in Playfair (64–88px), label in Inter:
- **5 Tage** — vom Briefing bis zum Livegang deiner Website
- **ab CHF 1'000** — für eine komplette Website
- **DE + EN** — zweisprachig inklusive, weitere Sprachen auf Anfrage
- **CH** — Hosting und Daten in der Schweiz
- **2** — Ansprechpersonen. Dieselben zwei, die bauen.
- **Brig** — vor Ort im Oberwallis, auch bei dir im Betrieb

Highest peak gets "5 Tage". All six carry `data-line-gap`.

### 5 Services overview
Label: `LEISTUNGEN`
**H2:** Von der Website bis zur Buchhaltung.
**Text:** Vier Bereiche, ein Team. Du bekommst keine Agentur mit zwölf Ansprechpersonen, sondern zwei Leute, die alles selbst bauen.
Below: the four service names in one row as large serif words with index numbers 01–04, separated by whitespace, no boxes. They are anchor links to the chapters.

### 6–9 Service chapters (four different editorial layouts)

**01 Websites & Marketing** — layout: large headline left (cols 1–6), copy right (cols 8–12).
Headline: Deine neue Website. In fünf Arbeitstagen.
Text: Auf Deutsch und Englisch, mit Buchung oder Kontakt angebunden, in der Schweiz gehostet. Dazu Texte, Newsletter und Social Media, wenn du es willst.
Tags: Website · Onlineshop · SEO · Newsletter · Social Media
Inline link: Ab CHF 1'000 → Preise
*(This is the entry offer: give it slightly more room than the other three.)*

**02 Automationen** — layout: small intro on top, one large serif statement underneath across 10 columns.
Statement: Die KI schlägt vor. Du entscheidest.
Text: Abläufe, die dich jeden Tag Zeit kosten, laufen automatisch: Anfragen beantworten, Offerten erstellen, Bewertungen bearbeiten.
Tags: Anfragen-Assistent · Offerten · Bewertungen · Termine

**03 Backoffice** — layout: copy left, a small four-step process figure right (Eingang → Erkennen → Zuordnen → Kontrolle), drawn in hairlines in the same stroke language as the line.
Headline: Das Büro, das sich nicht stapelt.
Text: Belege, Mahnungen, Terminplanung, Rapporte: Wir richten die Systeme ein und übernehmen im Abo, was du nicht selbst machen willst.
Tags: Belege · Rechnungen · Mahnwesen · Terminplanung · CRM

**04 Beratung & Schulung** — layout: narrow centred column, the quietest chapter.
Headline: Erst verstehen, dann automatisieren.
Text: Eine halbtägige KI-Schulung für dein Team. Oder ein Workshop, der klärt, welche Abläufe sich bei dir automatisieren lassen und welche nicht.
Tags: KI-Schulung · Prozess-Check · Tool-Auswahl

### 10 Cases
Label: `CASES`
**H2:** Was sich messbar ändert.
**Text:** Drei typische Ausgangslagen aus dem Oberwallis und was eine Lösung bewirkt. Die Zahlen stammen aus unseren Demo-Projekten, nicht aus Kundendaten.
Three rows (not cards), each: sector label · title · **before numeral → after numeral** set on the line as axis · one sentence.
- `HOTEL · ZERMATT (BEISPIEL)` — Gästeanfragen in vier Sprachen beantworten — **45 min** pro Tag, manuell → **5 min** pro Tag, prüfen und senden — Ein Assistent liest Mail, WhatsApp und Booking-Nachrichten und schlägt Antworten im Ton des Hauses vor.
- `HANDWERK · VISP (BEISPIEL)` — Offerte direkt von der Baustelle — **3 Tage** bis zur Offerte → **20 min** von der Sprachnotiz zum PDF — Sprachnotiz aufnehmen, Positionen werden erkannt und im Firmentemplate als Offerte ausgegeben.
- `TREUHAND · BRIG (BEISPIEL)` — Belege sortieren und zuordnen — **6 h** pro Woche → **30 min** pro Woche, Kontrolle — Eingehende Belege werden gelesen, dem Mandanten zugeordnet und in der Buchhaltung vorerfasst.

The "(Beispiel)" marker and the disclaimer sentence must stay visible. Build the rows so real client cases with a logo can replace them later.

### 11 Prices
Label: `PREISE`
**H2:** Fixpreise. Keine Stundenrechnung.
**Text:** Du weisst vor dem Start, was es kostet und wann es fertig ist.
Three columns separated by fog hairlines, no boxes, no "most popular" badge. Order: Website · Automation · Backoffice-Abo. The Website column is the only one with a solid forest CTA; the other two use text links.
- **Website** — CHF 1'000 einmalig — Neue Website, zweisprachig, in fünf Tagen — Konzept, Texte und Design · Deutsch und Englisch · Buchung oder Kontakt angebunden · Hosting in der Schweiz, erstes Jahr inklusive · Livegang nach 5 Arbeitstagen
- **Automation** — CHF 900 pro Projekt — Ein Ablauf, komplett automatisiert — Analyse des Ablaufs vor Ort · Umsetzung in 2–3 Wochen · Anbindung an Mail, WhatsApp, Buchhaltung · Schulung deines Teams · 30 Tage Nachbetreuung
- **Backoffice-Abo** — CHF 290 pro Monat — Wir übernehmen das Büro laufend — Pflege und Hosting der Website · Belege, Rechnungen, Mahnwesen · Newsletter und ein Social-Post pro Woche · Eine Automation-Stunde pro Monat · Antwort am selben Arbeitstag
Footnote: Alle Preise exkl. MWST. Grössere Projekte auf Anfrage.

### 12 Team
Label: `TEAM`
**H2:** Zwei Gründer, beide aus dem Oberwallis.
**Text:** Studium an der Universität St. Gallen, über zwei Jahre tägliche Arbeit mit KI-Werkzeugen in Projekten und Unternehmen. Jetzt zurück in der Region.
Two portraits, asymmetrically placed (different sizes, offset baselines resolved by the line), names in serif:
- **Janis Locher** — Beratung & Kunden — [ein Satz, Platzhalter]
- **Raphael Hildbrand** — Technik & Umsetzung — [ein Satz, Platzhalter]

### 13 Return + Contact (dark)
The ridge from the hero, back. Below it:
**Statement (serif, large):** 30 Minuten reichen für eine ehrliche Einschätzung.
**Text:** Wir schauen deine Ausgangslage an und sagen dir, was sich lohnt und was nicht. Unverbindlich, online oder bei dir im Betrieb.
**CTA:** [Termin buchen →] · secondary channels as plain text links from `contact.ts`

### Footer
Stacked logo · hallo@example.ch · +41 27 000 00 00 · Brig, Oberwallis · **Made in Oberwallis** · Impressum · Datenschutz · © 2026 HL Studio

---

## 8. Acceptance criteria

- With the line overlay hidden (`display:none`), every section still looks finished and reads clearly.
- Scrolling from top to bottom, I can follow one uninterrupted line. It is never absent from a viewport, never jumps, never crossfades.
- The hero line sits on the photographed ridge within 2px at 1280, 1440, 1920 and 2560 widths.
- The closing ridge is point-for-point the same shape as the hero ridge.
- No text is ever crossed by the line. Gaps are clean and symmetrical.
- A fast scroll from top to bottom takes under 3 seconds and never gets caught; only two short pins exist.
- H1 readable within 1 second of load. No layout shift.
- No section is a row of identical cards. No two service chapters share a layout.
- Forest green appears in at most one element per viewport besides the line.
- Lighthouse desktop: performance ≥ 90, accessibility ≥ 95. Reduced-motion mode works.

## 9. Phases (stop after each)

1. **Scaffold + static page.** Project setup, tokens, fonts, all sections with final copy and layouts, a static straight fog hairline where the line will be. Placeholder grey block for the hero image. → *Review.*
2. **Mountain.** Generate image variants via Gemini MCP, I pick one, run ridge extraction, show me the debug overlay. → *Review.*
3. **Line engine.** States, resampling, timeline, inertia, text-gap mask. First only ridge → facts → straight and the return at the end. → *Review.*
4. **Icons.** The four one-stroke icons and their chapter triggers. Show me each icon as a still first. → *Review.*
5. **Polish.** Reduced motion, performance, subpage shells, meta/OG image, Vercel deploy.

Before writing code in phase 1, reply with a short plan and any questions. If something in this brief conflicts with the three hard rules in section 2, the hard rules win.
