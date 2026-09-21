/**
 * Hero motion (BRIEF.md section 5, choreography rows 0 to 2).
 *
 * Opening (time based, skippable): the line draws in over 0.9s, the H1 fades
 * up at 0.6s, the photo fades in under the line from 0.8s. Any scroll input
 * completes it instantly.
 *
 * Lift-off (scroll based): over the first 60% of a viewport of scrolling the
 * photo fades and scales down 3.5%, the copy fades, the surface turns from
 * charcoal to ivory and the engine's hero tone follows, which turns the line
 * from ivory to forest.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp } from "./geometry";
import type { LineEngine } from "./engine";

export function setupHero(engine: LineEngine, hero: HTMLElement): () => void {
  const html = document.documentElement;
  const contents = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-content]"));
  const set = (name: string, value: number) => hero.style.setProperty(name, value.toFixed(4));

  const fade = ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=60%",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      set("--photo-out", 1 - p);
      set("--hero-scale", 1 - 0.035 * p);
      // the copy goes first, so the line drifting down through it meets no text
      set("--content-out", 1 - clamp(p * 2.5));
      set("--surface-mix", p);
      engine.heroFade = p;
      for (const c of contents) c.toggleAttribute("data-line-gap-off", p > 0.3);
    },
  });

  // opening
  html.setAttribute("data-opening", "");
  const vars = { photoIn: 0, textIn: 0 };
  const apply = () => {
    set("--photo-in", vars.photoIn);
    set("--text-in", vars.textIn);
  };
  apply();
  engine.drawProgress = 0;

  const skipEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  const finish = () => {
    html.removeAttribute("data-opening");
    for (const e of skipEvents) window.removeEventListener(e, skip);
    window.removeEventListener("scroll", skip);
  };
  const tl = gsap.timeline({ onComplete: finish });
  const skip = () => tl.progress(1);

  tl.to(engine, { drawProgress: 1, duration: 0.9, ease: "power2.out" }, 0)
    .to(vars, { textIn: 1, duration: 0.45, ease: "power2.out", onUpdate: apply }, 0.6)
    .to(vars, { photoIn: 1, duration: 1.0, ease: "power1.inOut", onUpdate: apply }, 0.8);

  for (const e of skipEvents) window.addEventListener(e, skip, { passive: true });
  window.addEventListener("scroll", skip, { passive: true });
  if (window.scrollY > 4) skip();

  return () => {
    fade.kill();
    tl.kill();
    finish();
    engine.drawProgress = 1;
  };
}
