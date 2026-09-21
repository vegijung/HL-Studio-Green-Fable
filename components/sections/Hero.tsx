import Image from "next/image";
import { Container, Grid } from "@/components/Container";
import { Cta } from "@/components/Cta";
import { Lines } from "@/components/Lines";
import { HeroRidgeDebug } from "@/components/sections/HeroRidgeDebug";
import ridge from "@/content/ridge.json";
import type { SiteContent } from "@/content/types";

/**
 * Sections 0 and 1: opening and hero on the dark surface.
 * The photograph covers the section; its ridge is in content/ridge.json and the
 * line locks onto it through the cover math in lib/ridge.ts. The CSS variables
 * (--photo-in, --text-in, --photo-out, --content-out, --hero-scale,
 * --surface-mix) are driven by lib/line/hero.ts; without the engine they keep
 * their defaults and the hero is static.
 */

/* runs before first paint: on desktop without reduced motion, start dark so the opening can fade things in */
const openingScript = `(function(){try{if(matchMedia('(min-width:1024px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-opening','');setTimeout(function(){document.documentElement.removeAttribute('data-opening')},4000)}}catch(e){}})();`;

export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <section
      id="hero"
      data-nav-sentinel
      data-tone="dark"
      className="relative flex min-h-svh flex-col justify-end bg-charcoal text-ivory"
    >
      <script dangerouslySetInnerHTML={{ __html: openingScript }} />

      <div aria-hidden data-hero-photo className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={`/hero/${ridge.source}`}
          alt=""
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
          data-hero-image
        />
      </div>
      <HeroRidgeDebug />

      <Container className="pb-24 pt-40 lg:pb-28">
        <div data-hero-content data-line-gap-group>
          <Grid>
            <div className="col-span-12 lg:col-span-8">
              <p className="label mb-8 text-ivory/80" data-line-gap>
                {content.label}
              </p>
              <h1 className="display-h1" data-line-gap>
                <Lines text={content.h1} />
              </h1>
              <p className="body-text-lg mt-10 text-ivory/85 lg:max-w-[52ch]" data-line-gap>
                {content.sub}
              </p>
              <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4" data-line-gap>
                <Cta label={content.ctaPrimary} variant="solid" />
                <Cta label={content.ctaSecondary.label} href={content.ctaSecondary.href} variant="text" />
              </div>
            </div>
          </Grid>
        </div>
      </Container>

      <p
        data-hero-content
        data-line-gap-group
        className="absolute bottom-10 right-6 z-20 font-serif text-lg italic text-ivory/70 lg:right-12"
        lang="gsw"
      >
        <span data-line-gap>{content.tagline}</span>
      </p>
    </section>
  );
}
