/**
 * The line engine (BRIEF.md section 5).
 *
 * One fixed SVG, one path of N points. Every place where the line should run
 * is an anchor element (`data-line-anchor`). The line rides an anchor with the
 * content while the anchor crosses the middle band of the viewport
 * (RIDE_BOTTOM -> RIDE_TOP) and blends to the next anchor in between. Shapes
 * morph with a per-point delay (thread feel), the rendered scroll position
 * lerps toward the real one (inertia), and text with `data-line-gap` is cut
 * out of the line through an SVG mask.
 *
 * Scroll positions come from ScrollTrigger instances tied to the elements, so
 * pins and resizes are handled by ScrollTrigger's refresh.
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
  X_MAX,
  X_MIN,
  type LineState,
  type MorphMode,
} from "./states";
import { ICONS, iconState, type IconName } from "./icons";

gsap.registerPlugin(ScrollTrigger);

export type ShapeName = "ridge" | "ridge-facts" | "straight";

/** the band of the viewport in which the line rides with an anchor */
export const RIDE_BOTTOM = 0.72;
export const RIDE_TOP = 0.22;
/** minimum scroll distance (in vh) reserved for the blend between two anchors */
const GAP_VH = 0.2;
/** inertia: fraction of the remaining distance closed per frame */
const INERTIA = 0.08;
/** the rendered line never trails the real scroll by more than this (in vh) */
const MAX_LAG_VH = 0.5;
/** padding around text gaps in px */
const GAP_PAD = 14;

const IVORY = [247, 245, 239];
const FOREST = [46, 75, 63];

/** an icon that forms on the line while it rides a chapter anchor */
interface IconSpec {
  name: IconName;
  slot: HTMLElement;
  headline: HTMLElement;
  /** document y of the headline's top, measured on refresh */
  headlineDocY: number;
  state: LineState;
}

interface Node {
  el: HTMLElement | null;
  shape: ShapeName;
  opacity: number;
  transition: MorphMode;
  /** viewport fraction where this anchor's ride ends (default RIDE_TOP) */
  rideTop: number;
  icon: IconSpec | null;
  ride: ScrollTrigger | null;
  pin: ScrollTrigger | null;
  /** ride window in scroll px */
  start: number;
  end: number;
  /** document y of the anchor's centre (anchors) */
  docY: number;
  /** viewport y at scroll 0 (hero) */
  heroBaseline: number;
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
  /** normalised viewport x of the point it marks */
  x: number;
  /** the point's dy (fraction of vh) in the anchor's own shape */
  dy: number;
  node: Node | null;
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

  private heroObserver: ResizeObserver | null = null;

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

  /** viewport y (0..1) of the line's baseline for a node at scroll s */
  private yAt(n: Node, s: number): number {
    if (!n.el) return n.heroBaseline - s / this.vh;
    const shift = n.pin ? clamp(s - n.pinStart, 0, n.pinLen) : 0;
    return (n.docY - s + shift) / this.vh;
  }

  private build() {
    const hero = document.getElementById("hero");
    this.nodes = [
      {
        el: null,
        shape: "ridge",
        opacity: 1,
        transition: "ltr",
        rideTop: RIDE_TOP,
        icon: null,
        ride: null,
        pin: null,
        start: 0,
        end: 0,
        docY: 0,
        heroBaseline: 0.3,
        pinStart: 0,
        pinLen: 0,
      },
    ];

    const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-line-anchor]"));
    for (const el of anchors) {
      const name = el.dataset.lineAnchor!;
      const rideTop = el.dataset.lineRideTop ? Number(el.dataset.lineRideTop) : RIDE_TOP;
      const ride = ScrollTrigger.create({
        trigger: el,
        start: `top ${RIDE_BOTTOM * 100}%`,
        end: `top ${rideTop * 100}%`,
      });
      const slot = document.querySelector<HTMLElement>(`[data-line-icon-slot="${name}"]`);
      const headline = document.querySelector<HTMLElement>(`[data-line-icon-headline="${name}"]`);
      const iconName = slot?.dataset.lineIcon as IconName | undefined;
      const icon: IconSpec | null =
        slot && headline && iconName && ICONS[iconName]
          ? { name: iconName, slot, headline, headlineDocY: 0, state: emptyState() }
          : null;
      let pin: ScrollTrigger | null = null;
      const pinLen = el.dataset.linePin;
      if (pinLen) {
        const target = el.dataset.linePinTarget
          ? document.querySelector<HTMLElement>(el.dataset.linePinTarget)
          : el.closest<HTMLElement>("section");
        // where in the viewport the anchor is when the pin starts (fraction of vh)
        const pinAt = el.dataset.linePinAt ? Number(el.dataset.linePinAt) : RIDE_TOP;
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
      this.nodes.push({
        el,
        shape: (el.dataset.lineShape as ShapeName) || "straight",
        opacity: el.dataset.lineOpacity ? Number(el.dataset.lineOpacity) : 1,
        transition: (el.dataset.lineTransition as MorphMode) || "ltr",
        rideTop,
        icon,
        ride,
        pin,
        start: 0,
        end: 0,
        docY: 0,
        heroBaseline: 0,
        pinStart: 0,
        pinLen: 0,
      });
    }

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
    this.svg.setAttribute("viewBox", `0 0 ${this.vw} ${this.vh}`);
    this.maskBg.setAttribute("width", String(this.vw));
    this.maskBg.setAttribute("height", String(this.vh));

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

    for (const n of this.nodes) {
      if (!n.el) {
        n.heroBaseline = baseline;
        continue;
      }
      const ride = n.ride!;
      n.start = ride.start;
      n.end = ride.end;
      n.docY = ride.start + RIDE_BOTTOM * this.vh + n.el.offsetHeight / 2;
      if (n.pin) {
        n.pinStart = n.pin.start;
        n.pinLen = n.pin.end - n.pin.start;
        n.end = n.pinStart;
      }
      if (n.icon) {
        // the icon stands on the line inside its slot; the headline drives its amount
        const anchorRect = n.el.getBoundingClientRect();
        const slotRect = n.icon.slot.getBoundingClientRect();
        const headRect = n.icon.headline.getBoundingClientRect();
        n.icon.headlineDocY = n.docY + (headRect.top - anchorRect.top);
        n.icon.state = iconState(
          ICONS[n.icon.name],
          { x0: slotRect.left / this.vw, w: slotRect.width / this.vw, h: slotRect.height / this.vh },
          this.vw,
          this.vh,
          X_MIN,
          X_MAX,
        );
      }
    }

    // consecutive ride windows must not overlap; leave room for the blend between them
    const gap = GAP_VH * this.vh;
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      if (a.end > b.start - gap) {
        const m = (a.end + b.start) / 2;
        if (!a.pin) a.end = Math.max(a.start, m - gap / 2);
        b.start = Math.max(a.end + gap, m + gap / 2);
        if (b.end < b.start) b.end = b.start;
      }
    }

    for (const s of this.sections) {
      // ScrollTrigger clamps `end` to the maximum scroll, so take the height from the element
      s.top = s.st.start;
      s.bottom = s.st.start + s.el.offsetHeight;
    }

    this.pathLength = 0;
    this.lastRendered = -1;
    this.lastMaskScroll = -1;
    this.dirty = true;
  }

  /**
   * A node's shape at scroll s. With an icon: the straight line pulled into the
   * icon as the chapter headline passes 60% of the viewport, released again
   * from 32% down to 20% (section 5, choreography rows 6 to 9).
   */
  private shapeOf(n: Node, s: number, out: LineState): LineState {
    const base = this.states[n.shape];
    if (!n.icon) return copyState(base, out);
    // the headline drives the icon; where a layout puts it far below the label
    // (Automationen), a point just under the label takes over so the icon still forms
    const ref = Math.min(n.icon.headlineDocY, n.docY + 0.22 * this.vh);
    const hy = (ref - s) / this.vh;
    const form = clamp((0.6 - hy) / 0.15);
    const release = clamp((0.36 - hy) / 0.12);
    return morphInto(out, base, n.icon.state, form * (1 - release), "ltr");
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
      return { y, opacity: n.opacity };
    }

    // a pinned anchor morphs in place during its pin; the blend to the next anchor starts after it
    const blendStart = n.pin ? n.pinStart + n.pinLen : n.end;
    const range = Math.max(1, next.start - blendStart);
    const u = easeInOutQuad(clamp((s - blendStart) / range));
    const morphLen = n.pin ? n.pinLen : range;
    const um = clamp((s - n.end) / Math.max(1, morphLen));
    morphInto(this.work, this.shapeOf(n, s, this.tmpA), this.shapeOf(next, s, this.tmpB), um, next.transition);
    return {
      y: lerp(this.yAt(n, s), this.yAt(next, s), u),
      opacity: lerp(n.opacity, next.opacity, u),
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
      } else if (s <= n.end || (n.pin && s <= n.pinStart + n.pinLen)) {
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
