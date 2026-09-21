import { Container, Grid } from "@/components/Container";
import { Cta } from "@/components/Cta";
import { Lines } from "@/components/Lines";
import type { SiteContent } from "@/content/types";

/**
 * Sections 0 and 1: opening and hero on the dark surface.
 * Phase 1: a grey placeholder block stands in for the mountain photograph.
 */
export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <section
      id="hero"
      data-nav-sentinel
      data-tone="dark"
      className="relative flex min-h-svh flex-col justify-end bg-charcoal text-ivory"
    >
      {/* placeholder for the hero image, replaced in phase 2 */}
      <div aria-hidden className="absolute inset-0 z-0 bg-[#2a2c2a]" />

      <Container className="pb-24 pt-40 lg:pb-28">
        <Grid>
          <div className="col-span-12 lg:col-span-8">
            <p className="label mb-8 text-ivory/80">{content.label}</p>
            <h1 className="display-h1" data-line-gap>
              <Lines text={content.h1} />
            </h1>
            <p className="body-text-lg mt-10 text-ivory/85 lg:max-w-[52ch]">{content.sub}</p>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
              <Cta label={content.ctaPrimary} variant="solid" />
              <Cta label={content.ctaSecondary.label} href={content.ctaSecondary.href} variant="text" />
            </div>
          </div>
        </Grid>
      </Container>

      <p
        className="absolute bottom-10 right-6 z-20 font-serif text-lg italic text-ivory/70 lg:right-12"
        lang="gsw"
      >
        {content.tagline}
      </p>
    </section>
  );
}
