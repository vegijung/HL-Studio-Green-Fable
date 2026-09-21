/**
 * The line engine (BRIEF.md section 5).
 *
 * One fixed SVG, one path of N points. The page has three kinds of nodes:
 *
 *   hero     the ridge, registered on the photo at scroll 0
 *   anchor   an element (`data-line-anchor`) the line rides with the content
 *            while it crosses the middle band of the viewport (facts, contact)
 *   stage    a fixed spot on the right of the viewport where the thread sits as
 *            a short segment and is pulled into one icon after another as the
 *            chapters pass (the middle of the page)
 *
 * Between nodes the shape morphs with a per-point delay (thread feel) and the
 * baseline blends. The rendered scroll position lerps toward the real one
 * (inertia), the colour follows the surface under the line, and text with
 * `data-line-gap` is cut out of the line through an SVG mask.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RidgeData } from "@/lib/ridge";
import { N, catmullRomPath, clamp, easeInOutQuad, lerp } from "./geometry";
import {
  copyState,
  emptyState,
  morphInto,
  ridgeState,
  straightState,
  stretchState,
  type LineState,
  type MorphMode,
} from "./states";
import { ICONS, iconState, segmentState, type IconName } from "./icons";

gsap.registerPlugin(ScrollTrigger);

export type ShapeName = "ridge" | "ridge-facts" | "straight";

/** the band of the viewport in which the line rides with an anchor */
export const RIDE_BOTTOM = 0.72;
export const RIDE_TOP = 0.22;
/** minimum scroll distance (in vh) reserved for the blend between two nodes */
const GAP_VH = 0.2;
/** the blend from an anchor onto the stage takes at least this long (in vh): contract, then drop */
const STAGE_GAP_VH = 0.4;
/** inertia: fraction of the remaining distance closed per frame */
const INERTIA = 0.08;
/** the rendered line never trails the real scroll by more than this (in vh) */
const MAX_LAG_VH = 0.5;
/** padding around text gaps in px */
const GAP_PAD = 14;
/** stage: a chapter boundary morphs the icon while it passes from this to that viewport fraction */
const STAGE_MORPH_FROM = 0.82;
const STAGE_MORPH_TO = 0.34;
/** the part of an icon-to-icon morph spent settling into the segment before the next icon rises */
const STAGE_SETTLE = 0.4;
/** stage icon size in px */
const ICON_SIZE = 200;
/** stage opacity before the chapters, during them, and after them */
const STAGE_OPACITY = [0.6, 1, 0.4];
/** the stage's icons in chapter order, and the section ids whose top starts the morph into each one */
const STAGE_PROGRAMME: Array<{ section: string; icon: IconName | null }> = [
  { section: "websites", icon: "browser" },
  { section: "automationen", icon: "loops" },
  { section: "backoffice", icon: "sheet" },
  { section: "beratung-schulung", icon: "bubble" },
  { section: "cases", icon: null },
];

const IVORY = [247, 245, 239];
const FOREST = [46, 75, 63];

interface Node {
  kind: "hero" | "anchor" | "stage";
  el: HTMLElement | null;
  shape: ShapeName;
  opacity: number;
  transition: MorphMode;
  /** viewport fraction where an anchor's ride ends */
  rideTop: number;
  ride: ScrollTrigger | null;
  pin: ScrollTrigger | null;
  /** shape the line morphs into during the pin, and how */
  pinShape: ShapeName;
  pinTransition: MorphMode;
  /** viewport fractions: where the anchor sits when the pin starts, and where the line lets go after it */
  pinAt: number;
  release: number;
  /** scroll px at which the line lets go of a pinned anchor (pin end plus the hold) */
  holdEnd: number;
  /** window in scroll px during which the line holds this node */
  start: number;
  end: number;
  /** document y of the anchor's centre (anchors) */
  docY: number;
  /** fixed viewport y (hero at scroll 0, stage) */
  fixedY: number;
  pinStart: number;
  pinLen: number;
}

interface Section {
  el: HTMLElement;
  st: ScrollTrigger;
  top: number;
  bottom: number;
  tone: number;
  hero: boolean;
}

interface Gap {
  el: HTMLElement;
  group: HTMLElement | null;
}

/** an element that keeps its vertical position glued to the line (the facts annotations) */
interface Follower {
  el: HTMLElement;
  x: number;
  dy: number;
  node: Node | null;
}

interface StageStep {
  /** document y of the section top that drives this step */
  docTop: number;
  shape: LineState;
}

export class LineEngine {
  /** 0..1 while the opening draws the line in; 1 afterwards */
  drawProgress = 1;
  /** 0 = the hero is still dark, 1 = its surface is ivory (set by the hero motion) */
  heroFade = 0;

  private readonly svg: SVGSVGElement;
  private readonly path: SVGPathElement;
  private readonly maskBg: SVGRectElement;
  private readonly maskRects: SVGGElement;
  private readonly ridge: RidgeData;

  private states: Record<ShapeName, LineState> = {
    ridge: emptyState(),
    "ridge-facts": emptyState(),
    straight: straightState(),
  };
  private work = emptyState();
  private tmpA = emptyState();
  private tmpB = emptyState();
  private xs = new Float64Array(N);
  private ys = new Float64Array(N);

  private nodes: Node[] = [];
  private sections: Section[] = [];
  private gaps: Gap[] = [];
  private followers: Follower[] = [];

  /** the stage: its element, the plain segment and the programme of icons */
  private stageEl: HTMLElement | null = null;
  private stageSegment = emptyState();
  private stageSteps: StageStep[] = [];

  private vw = 0;
  private vh = 0;
  private rendered = 0;
  private lastRendered = -1;
  private lastMaskScroll = -1;
  private dirty = true;
  private color = [...FOREST];
  private colorInit = false;
  private pathLength = 0;
  private drawing = false;
  private started = false;
  private heroObserver: ResizeObserver | null = null;

  private readonly tick = () => this.frame();
  private readonly onRefresh = () => this.measure();

  constructor(svg: SVGSVGElement, ridge: RidgeData) {
    this.svg = svg;
    this.ridge = ridge;
    this.path = svg.querySelector("[data-line-path]") as SVGPathElement;
    this.maskBg = svg.querySelector("[data-mask-bg]") as SVGRectElement;
    this.maskRects = svg.querySelector("[data-mask-rects]") as SVGGElement;
  }

  start() {
    if (this.started) return;
    this.started = true;
    document.documentElement.dataset.line = "on";
    this.build();
    ScrollTrigger.addEventListener("refresh", this.onRefresh);
    ScrollTrigger.refresh();
    this.rendered = window.scrollY;
    gsap.ticker.add(this.tick);

    // the hero box is the ridge's reference frame; when its size settles (fonts, clearance), re-measure
    const hero = document.getElementById("hero");
    if (hero && "ResizeObserver" in window) {
      let lastH = hero.offsetHeight;
      this.heroObserver = new ResizeObserver(() => {
        if (hero.offsetHeight !== lastH) {
          lastH = hero.offsetHeight;
          ScrollTrigger.refresh();
        }
      });
      this.heroObserver.observe(hero);
    }
  }

  destroy() {
    gsap.ticker.remove(this.tick);
    this.heroObserver?.disconnect();
    ScrollTrigger.removeEventListener("refresh", this.onRefresh);
    for (const n of this.nodes) {
      n.ride?.kill();
      n.pin?.kill();
    }
    for (const s of this.sections) s.st.kill();
    this.nodes = [];
    this.sections = [];
    delete document.documentElement.dataset.line;
    this.started = false;
  }

  private newNode(partial: Partial<Node> & Pick<Node, "kind">): Node {
    return {
      el: null,
      shape: "straight",
      opacity: 1,
      transition: "ltr",
      rideTop: RIDE_TOP,
      ride: null,
      pin: null,
      pinShape: "straight",
      pinTransition: "outside-in",
      pinAt: RIDE_TOP,
      release: RIDE_TOP,
      holdEnd: 0,
      start: 0,
      end: 0,
      docY: 0,
      fixedY: 0.5,
      pinStart: 0,
      pinLen: 0,
      ...partial,
    };
  }

  /** viewport y (0..1) of the line's baseline for a node at scroll s */
  private yAt(n: Node, s: number): number {
    if (n.kind === "hero") return n.fixedY - s / this.vh;
    if (n.kind === "stage") return n.fixedY;
    const shift = n.pin ? clamp(s - n.pinStart, 0, n.pinLen) : 0;
    return (n.docY - s + shift) / this.vh;
  }

  private build() {
    const hero = document.getElementById("hero");
    this.stageEl = document.querySelector<HTMLElement>("[data-line-stage]");
    this.nodes = [this.newNode({ kind: "hero", shape: "ridge", fixedY: 0.3 })];

    const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-line-anchor]"));
    // the stage node goes before the first anchor that follows the section it starts from
    const stageFrom = this.stageEl ? document.getElementById(this.stageEl.dataset.lineStageFrom || "") : null;
    let stageInserted = !this.stageEl;
    for (const el of anchors) {
      if (
        !stageInserted &&
        this.stageEl &&
        stageFrom &&
        stageFrom.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        this.nodes.push(this.newNode({ kind: "stage", el: this.stageEl }));
        stageInserted = true;
      }
      const rideTop = el.dataset.lineRideTop ? Number(el.dataset.lineRideTop) : RIDE_TOP;
      const ride = ScrollTrigger.create({
        trigger: el,
        start: `top ${RIDE_BOTTOM * 100}%`,
        end: `top ${rideTop * 100}%`,
      });
      let pin: ScrollTrigger | null = null;
      const pinLen = el.dataset.linePin;
      const pinAt = el.dataset.linePinAt ? Number(el.dataset.linePinAt) : RIDE_TOP;
      if (pinLen) {
        const target = el.dataset.linePinTarget
          ? document.querySelector<HTMLElement>(el.dataset.linePinTarget)
          : el.closest<HTMLElement>("section");
        if (target) {
          pin = ScrollTrigger.create({
            trigger: el,
            start: `top ${pinAt * 100}%`,
            end: `+=${pinLen}`,
            pin: target,
            pinSpacing: true,
            anticipatePin: 1,
          });
        }
      }
      this.nodes.push(
        this.newNode({
          kind: "anchor",
          el,
          shape: (el.dataset.lineShape as ShapeName) || "straight",
          opacity: el.dataset.lineOpacity ? Number(el.dataset.lineOpacity) : 1,
          transition: (el.dataset.lineTransition as MorphMode) || "ltr",
          rideTop,
          ride,
          pin,
          pinShape: (el.dataset.linePinShape as ShapeName) || "straight",
          pinTransition: (el.dataset.linePinTransition as MorphMode) || "outside-in",
          pinAt,
          release: el.dataset.lineRelease ? Number(el.dataset.lineRelease) : pinAt,
        }),
      );
    }
    if (!stageInserted && this.stageEl) this.nodes.push(this.newNode({ kind: "stage", el: this.stageEl }));

    this.sections = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]")).map((el) => ({
      el,
      st: ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top" }),
      top: 0,
      bottom: 0,
      tone: el.dataset.tone === "dark" ? 0 : 1,
      hero: el === hero,
    }));
  }

  /** re-measures everything that depends on layout; runs on every ScrollTrigger refresh */
  private measure() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.svg.setAttribute("viewBox", `0 0 ${this.vw} ${this.vh}`);
    this.maskBg.setAttribute("width", String(this.vw));
    this.maskBg.setAttribute("height", String(this.vh));

    // gaps and followers are collected here, not in build(), because the facts render after start
    this.gaps = Array.from(document.querySelectorAll<HTMLElement>("[data-line-gap]")).map((el) => ({
      el,
      group: el.closest<HTMLElement>("[data-line-gap-group]"),
    }));
    this.followers = Array.from(document.querySelectorAll<HTMLElement>("[data-line-follow]")).map((el) => ({
      el,
      x: Number(el.dataset.lineFollowX),
      dy: Number(el.dataset.lineFollowDy),
      node: this.nodes.find((n) => n.el?.dataset.lineAnchor === el.dataset.lineFollow) ?? null,
    }));

    const hero = document.getElementById("hero");
    const box = hero ? hero.getBoundingClientRect() : { width: this.vw, height: this.vh };
    const { state, baseline } = ridgeState(this.ridge, box.width, box.height, this.vw, this.vh);
    this.states.ridge = state;
    this.states["ridge-facts"] = stretchState(state, 1.3);
    this.states.straight = straightState();

    // the hero copy must start below the ridge's lowest point on the left, whatever the crop
    if (hero) {
      let low = -Infinity;
      for (let i = 0; i < N; i++) {
        if (state.x[i] >= 0.03 && state.x[i] <= 0.32) low = Math.max(low, state.dy[i]);
      }
      const clear = Number.isFinite(low) ? (baseline + low) * this.vh + 30 : 0;
      hero.style.setProperty("--ridge-clear", `${Math.round(clear)}px`);
    }

    for (const s of this.sections) {
      // ScrollTrigger clamps `end` to the maximum scroll, so take the height from the element
      s.top = s.st.start;
      s.bottom = s.st.start + s.el.offsetHeight;
    }
    const sectionTop = (id: string) => this.sections.find((s) => s.el.id === id)?.top ?? null;

    for (const n of this.nodes) {
      if (n.kind === "hero") {
        n.fixedY = baseline;
        continue;
      }
      if (n.kind === "anchor" && n.el) {
        const ride = n.ride!;
        n.start = ride.start;
        n.end = ride.end;
        n.docY = ride.start + RIDE_BOTTOM * this.vh + n.el.offsetHeight / 2;
        if (n.pin) {
          n.pinStart = n.pin.start;
          n.pinLen = n.pin.end - n.pin.start;
          n.end = n.pinStart;
          // after the pin the flat line rides on with the content until the anchor reaches `release`
          n.holdEnd = n.pinStart + n.pinLen + Math.max(0, n.pinAt - n.release) * this.vh;
        }
      }
    }

    // the stage: a fixed box on the right; holds from the first stage section to just before the next anchor
    const stage = this.nodes.find((n) => n.kind === "stage");
    if (stage && this.stageEl) {
      const rect = this.stageEl.getBoundingClientRect();
      const x0 = rect.left / this.vw;
      const x1 = rect.right / this.vw;
      stage.fixedY = rect.bottom / this.vh;
      const iconBox = {
        x0: (rect.left + rect.width / 2 - ICON_SIZE / 2) / this.vw,
        w: ICON_SIZE / this.vw,
        h: ICON_SIZE / this.vh,
      };
      this.stageSegment = segmentState(iconBox, this.vw, this.vh, x0, x1);
      this.stageSteps = STAGE_PROGRAMME.flatMap((step) => {
        const docTop = sectionTop(step.section);
        if (docTop === null) return [];
        const shape = step.icon
          ? iconState(ICONS[step.icon], iconBox, this.vw, this.vh, x0, x1)
          : copyState(this.stageSegment);
        return [{ docTop, shape }];
      });
      const stageIndex = this.nodes.indexOf(stage);
      const first = this.stageSteps[0];
      const firstSection = sectionTop(this.stageEl.dataset.lineStageFrom || "leistungen");
      stage.start = (firstSection ?? first?.docTop ?? 0) - 0.55 * this.vh;
      const after = this.nodes[stageIndex + 1];
      stage.end = after ? after.start - 0.6 * this.vh : Number.MAX_SAFE_INTEGER;
      if (stage.end < stage.start) stage.end = stage.start;
    }

    // consecutive windows must not overlap; leave room for the blend between them
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      const gap = (b.kind === "stage" ? STAGE_GAP_VH : GAP_VH) * this.vh;
      const aEnd = a.pin ? a.holdEnd : a.end;
      if (aEnd > b.start - gap) {
        const m = (aEnd + b.start) / 2;
        if (!a.pin && a.kind !== "stage") a.end = Math.max(a.start, m - gap / 2);
        b.start = Math.max(aEnd + gap, m + gap / 2);
        if (b.end < b.start) b.end = b.start;
      }
    }

    this.pathLength = 0;
    this.lastRendered = -1;
    this.lastMaskScroll = -1;
    this.dirty = true;
  }

  /** the stage's shape at scroll s: segment or icon, or the morph between two steps */
  private stageShape(s: number, out: LineState): LineState {
    const steps = this.stageSteps;
    let k = -1;
    let p = 0;
    for (let i = 0; i < steps.length; i++) {
      const prog = clamp((STAGE_MORPH_FROM * this.vh - (steps[i].docTop - s)) / ((STAGE_MORPH_FROM - STAGE_MORPH_TO) * this.vh));
      if (prog <= 0) break;
      k = i;
      p = prog;
    }
    if (k < 0) return copyState(this.stageSegment, out);
    const from = k === 0 ? this.stageSegment : steps[k - 1].shape;
    return this.morphViaSegment(out, from, steps[k].shape, p);
  }

  /**
   * One icon into the next: the thread first settles back into the segment,
   * then rises into the new shape. A direct point-to-point morph between two
   * icons passes through a tangle halfway; through the flat line it reads as
   * one thread letting go and taking the next form. The change travels along
   * the thread from its start to its end.
   */
  private morphViaSegment(out: LineState, from: LineState, to: LineState, p: number): LineState {
    const seg = this.stageSegment;
    if (from === seg || to === seg) return morphInto(out, from, to, p, "thread");
    if (p < STAGE_SETTLE) return morphInto(out, from, seg, p / STAGE_SETTLE, "thread");
    return morphInto(out, seg, to, (p - STAGE_SETTLE) / (1 - STAGE_SETTLE), "thread");
  }

  /** the stage's opacity: quieter before the chapters and after them */
  private stageOpacity(s: number): number {
    const steps = this.stageSteps;
    if (steps.length === 0) return STAGE_OPACITY[1];
    const prog = (i: number) =>
      clamp((STAGE_MORPH_FROM * this.vh - (steps[i].docTop - s)) / ((STAGE_MORPH_FROM - STAGE_MORPH_TO) * this.vh));
    const last = steps.length - 1;
    return lerp(lerp(STAGE_OPACITY[0], STAGE_OPACITY[1], prog(0)), STAGE_OPACITY[2], prog(last));
  }

  private shapeOf(n: Node, s: number, out: LineState): LineState {
    if (n.kind === "stage") return this.stageShape(s, out);
    return copyState(this.states[n.shape], out);
  }

  private opacityOf(n: Node, s: number): number {
    return n.kind === "stage" ? this.stageOpacity(s) : n.opacity;
  }

  /** shape, baseline and opacity of the line at scroll position s */
  private evaluate(s: number): { y: number; opacity: number } {
    const nodes = this.nodes;
    let i = 0;
    for (let k = 0; k < nodes.length; k++) if (nodes[k].start <= s) i = k;
    const n = nodes[i];
    const next = nodes[i + 1];

    if (s <= n.end || !next) {
      this.shapeOf(n, s, this.work);
      // the last anchor keeps riding to the page end, but never up under the nav
      const y = next ? this.yAt(n, s) : Math.max(RIDE_TOP + 0.06, this.yAt(n, s));
      return { y, opacity: this.opacityOf(n, s) };
    }

    // a pinned anchor morphs in place during its pin (the flatten), then holds the flat shape
    if (n.pin && s <= n.holdEnd) {
      const um = clamp((s - n.pinStart) / Math.max(1, n.pinLen));
      morphInto(this.work, this.shapeOf(n, s, this.tmpA), this.states[n.pinShape], um, n.pinTransition);
      return { y: this.yAt(n, s), opacity: this.opacityOf(n, s) };
    }

    // the blend to the next node
    const blendStart = n.pin ? n.holdEnd : n.end;
    const range = Math.max(1, next.start - blendStart);
    const u = clamp((s - blendStart) / range);
    const from = n.pin ? copyState(this.states[n.pinShape], this.tmpA) : this.shapeOf(n, s, this.tmpA);
    morphInto(this.work, from, this.shapeOf(next, s, this.tmpB), u, next.transition);
    const ue = easeInOutQuad(u);
    return {
      y: lerp(this.yAt(n, s), this.yAt(next, s), ue),
      opacity: lerp(this.opacityOf(n, s), this.opacityOf(next, s), ue),
    };
  }

  private frame() {
    if (!this.vh) return;
    const target = window.scrollY;
    const dist = target - this.rendered;
    if (Math.abs(dist) < 0.05) {
      this.rendered = target;
    } else {
      // inertia, but never more than ~300ms behind: close faster the further away
      const factor = Math.min(1, INERTIA + Math.abs(dist) / (4 * this.vh));
      this.rendered += dist * factor;
      const maxLag = MAX_LAG_VH * this.vh;
      if (Math.abs(target - this.rendered) > maxLag) {
        this.rendered = target - Math.sign(target - this.rendered) * maxLag;
      }
    }

    // render() clears `dirty` itself once the colour has converged
    if (this.rendered !== this.lastRendered || this.dirty) {
      this.render(this.rendered);
      this.lastRendered = this.rendered;
    }
    if (target !== this.lastMaskScroll) {
      this.updateMask();
      this.lastMaskScroll = target;
    }
    this.updateDraw();
  }

  private render(s: number) {
    const { y, opacity } = this.evaluate(s);
    const w = this.work;
    for (let i = 0; i < N; i++) {
      this.xs[i] = w.x[i] * this.vw;
      this.ys[i] = (y + w.dy[i]) * this.vh;
    }
    this.path.setAttribute("d", catmullRomPath(this.xs, this.ys));
    this.path.setAttribute("stroke-opacity", opacity.toFixed(3));
    this.updateFollowers(s, y);

    // colour follows the surface under the line's baseline
    const docY = y * this.vh + s;
    let tone = 1;
    for (const sec of this.sections) {
      if (docY >= sec.top && docY < sec.bottom) {
        tone = sec.hero ? this.heroFade : sec.tone;
        break;
      }
    }
    // the colour eases toward the surface's colour over a few frames
    const k = this.colorInit ? 0.2 : 1;
    this.colorInit = true;
    let remaining = 0;
    for (let c = 0; c < 3; c++) {
      const targetC = lerp(IVORY[c], FOREST[c], tone);
      this.color[c] = lerp(this.color[c], targetC, k);
      remaining = Math.max(remaining, Math.abs(targetC - this.color[c]));
    }
    this.path.setAttribute(
      "stroke",
      `rgb(${Math.round(this.color[0])} ${Math.round(this.color[1])} ${Math.round(this.color[2])})`,
    );
    this.dirty = remaining > 0.5;
  }

  /** dy of the current shape at a normalised x, by linear interpolation */
  private dyAt(x: number): number {
    const xs = this.work.x;
    const dys = this.work.dy;
    if (x <= xs[0]) return dys[0];
    if (x >= xs[N - 1]) return dys[N - 1];
    let i = 1;
    while (i < N - 1 && xs[i] < x) i++;
    const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1] || 1);
    return lerp(dys[i - 1], dys[i], t);
  }

  /**
   * Followers stay glued to the line: while the line rides or pins on their
   * anchor they are shifted so their point sits on the current shape; before
   * that they rest at their ridge positions, afterwards on the flattened line.
   */
  private updateFollowers(s: number, y: number) {
    const tops = new Map<Node, number>();
    for (const f of this.followers) {
      const n = f.node;
      if (!n || !n.el) continue;
      let offset: number;
      if (s < n.start) {
        offset = 0;
      } else if (s <= n.end || (n.pin && s <= n.holdEnd)) {
        let top = tops.get(n);
        if (top === undefined) {
          top = n.el.getBoundingClientRect().top;
          tops.set(n, top);
        }
        const lineY = (y + this.dyAt(f.x)) * this.vh;
        // ramp the grip in over a short scroll distance so the line's lag does not arrive as a jump
        const grip = easeInOutQuad(clamp((s - n.start) / (0.15 * this.vh)));
        offset = (lineY - (top + f.dy * this.vh)) * grip;
      } else {
        offset = -f.dy * this.vh;
      }
      f.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  }

  /** stroke-dashoffset draw-in during the opening */
  private updateDraw() {
    if (this.drawProgress >= 1) {
      if (this.drawing) {
        this.path.removeAttribute("stroke-dasharray");
        this.path.removeAttribute("stroke-dashoffset");
        this.drawing = false;
      }
      return;
    }
    if (!this.pathLength) this.pathLength = this.path.getTotalLength();
    this.drawing = true;
    this.path.setAttribute("stroke-dasharray", String(this.pathLength));
    this.path.setAttribute("stroke-dashoffset", String(this.pathLength * (1 - this.drawProgress)));
  }

  /** text gaps: black rects in the mask, in viewport space (section 5, point 8) */
  private updateMask() {
    let html = "";
    const vh = this.vh;
    for (const g of this.gaps) {
      if (g.group && g.group.hasAttribute("data-line-gap-off")) continue;
      const r = g.el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < -GAP_PAD || r.top > vh + GAP_PAD) continue;
      html += `<rect x="${(r.left - GAP_PAD).toFixed(1)}" y="${(r.top - GAP_PAD).toFixed(1)}" width="${(r.width + 2 * GAP_PAD).toFixed(1)}" height="${(r.height + 2 * GAP_PAD).toFixed(1)}" fill="black"/>`;
    }
    this.maskRects.innerHTML = html;
  }
}
