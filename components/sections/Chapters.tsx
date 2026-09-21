import Link from "next/link";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section } from "@/components/Section";
import { Tags } from "@/components/Tags";
import { ProcessFigure } from "@/components/ProcessFigure";
import type { Service, ServiceSlug } from "@/content/types";

/**
 * Sections 6 to 9: four service chapters, four different editorial layouts.
 * Each chapter opens with its anchor rule. The index label sits on the rule
 * (the line is cut around it) and the one-stroke icon forms on the line to the
 * right of the label while the headline passes through the viewport.
 */

const ICON_BY_SLUG: Record<ServiceSlug, "browser" | "loops" | "sheet" | "bubble"> = {
  websites: "browser",
  automationen: "loops",
  backoffice: "sheet",
  "beratung-schulung": "bubble",
};

function ChapterHead({ service, centered = false }: { service: Service; centered?: boolean }) {
  const anchor = `chapter-${service.slug}`;
  return (
    <div className="relative">
      <Hairline anchor={anchor} rideTop={0.05} />
      <div
        className={`absolute bottom-0 flex items-end gap-10 ${centered ? "left-1/2 -translate-x-1/2" : "left-0"}`}
      >
        <p className="label flex translate-y-1/2 items-center gap-4 bg-transparent" data-line-gap>
          <span className="text-charcoal/60">{service.index}</span>
          <span>{service.name}</span>
        </p>
        <span
          aria-hidden
          data-line-icon-slot={anchor}
          data-line-icon={ICON_BY_SLUG[service.slug]}
          className="block h-[120px] w-[120px]"
        />
      </div>
    </div>
  );
}

/** 01: large headline left (cols 1–6), copy right (cols 8–12). The entry offer, slightly more room. */
export function ChapterWebsites({ service }: { service: Service }) {
  return (
    <Section id={service.slug} className="lg:pb-[15rem]">
      <ChapterHead service={service} />
      <Grid className="mt-24 lg:mt-32">
        <h2
          className="display-statement col-span-12 lg:col-span-6"
          data-line-gap
          data-line-icon-headline={`chapter-${service.slug}`}
        >
          {service.headline}
        </h2>
        <div className="col-span-12 mt-12 lg:col-span-5 lg:col-start-8 lg:mt-3">
          <p className="body-text-lg">{service.text}</p>
          <Tags items={service.tags} className="mt-10" />
          {service.link && (
            <Link
              href={service.link.href}
              className="mt-10 inline-block text-forest underline decoration-forest/30 underline-offset-[6px] transition-colors hover:decoration-forest"
            >
              {service.link.label}
            </Link>
          )}
        </div>
      </Grid>
    </Section>
  );
}

/** 02: small intro on top, one large serif statement underneath across 10 columns */
export function ChapterAutomationen({ service }: { service: Service }) {
  return (
    <Section id={service.slug}>
      <ChapterHead service={service} />
      <Grid className="mt-24 lg:mt-32">
        <div className="col-span-12 lg:col-span-5">
          <p className="body-text-lg">{service.text}</p>
          <Tags items={service.tags} className="mt-8" />
        </div>
        <h2
          className="display-statement col-span-12 mt-20 lg:col-span-10 lg:mt-32"
          data-line-gap
          data-line-icon-headline={`chapter-${service.slug}`}
        >
          {service.headline}
        </h2>
      </Grid>
    </Section>
  );
}

/** 03: copy left, four-step process figure right */
export function ChapterBackoffice({ service }: { service: Service }) {
  return (
    <Section id={service.slug}>
      <ChapterHead service={service} />
      <Grid className="mt-24 lg:mt-32">
        <div className="col-span-12 lg:col-span-5">
          <h2 className="display-h2" data-line-gap data-line-icon-headline={`chapter-${service.slug}`}>
            {service.headline}
          </h2>
          <p className="body-text-lg mt-8">{service.text}</p>
          <Tags items={service.tags} className="mt-10" />
        </div>
        <div className="col-span-12 mt-16 lg:col-span-6 lg:col-start-7 lg:mt-4">
          <ProcessFigure steps={["Eingang", "Erkennen", "Zuordnen", "Kontrolle"]} />
        </div>
      </Grid>
    </Section>
  );
}

/** 04: narrow centred column, the quietest chapter */
export function ChapterSchulung({ service }: { service: Service }) {
  return (
    <Section id={service.slug}>
      <ChapterHead service={service} centered />
      <div className="mx-auto mt-24 flex max-w-[40rem] flex-col items-center text-center lg:mt-32">
        <h2 className="display-h2" data-line-gap data-line-icon-headline={`chapter-${service.slug}`}>
          {service.headline}
        </h2>
        <p className="body-text-lg mt-8">{service.text}</p>
        <Tags items={service.tags} className="mt-10" />
      </div>
    </Section>
  );
}
