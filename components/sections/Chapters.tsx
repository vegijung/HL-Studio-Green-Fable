import Link from "next/link";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section } from "@/components/Section";
import { Tags } from "@/components/Tags";
import { ProcessFigure } from "@/components/ProcessFigure";
import type { Service } from "@/content/types";

/**
 * Sections 6 to 9: four service chapters, four different editorial layouts.
 * Each chapter opens with a hairline (where the line runs) and its index label
 * beside which the icon will sit in phase 4.
 */

function ChapterLabel({ service, className }: { service: Service; className?: string }) {
  return (
    <p className={`label flex items-center gap-4 ${className ?? ""}`}>
      <span className="text-charcoal/60">{service.index}</span>
      <span>{service.name}</span>
    </p>
  );
}

/** 01: large headline left (cols 1–6), copy right (cols 8–12). The entry offer, slightly more room. */
export function ChapterWebsites({ service }: { service: Service }) {
  return (
    <Section id={service.slug} className="lg:pb-[15rem]">
      <Hairline />
      <ChapterLabel service={service} className="mt-8" />
      <Grid className="mt-20 lg:mt-28">
        <h2 className="display-statement col-span-12 lg:col-span-6" data-line-gap>
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
      <Hairline />
      <ChapterLabel service={service} className="mt-8" />
      <Grid className="mt-20 lg:mt-28">
        <div className="col-span-12 lg:col-span-5">
          <p className="body-text-lg">{service.text}</p>
          <Tags items={service.tags} className="mt-8" />
        </div>
        <h2
          className="display-statement col-span-12 mt-20 lg:col-span-10 lg:mt-32"
          data-line-gap
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
      <Hairline />
      <ChapterLabel service={service} className="mt-8" />
      <Grid className="mt-20 lg:mt-28">
        <div className="col-span-12 lg:col-span-5">
          <h2 className="display-h2" data-line-gap>
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
      <Hairline />
      <div className="mx-auto mt-8 flex max-w-[40rem] flex-col items-center text-center">
        <ChapterLabel service={service} />
        <h2 className="display-h2 mt-20 lg:mt-28" data-line-gap>
          {service.headline}
        </h2>
        <p className="body-text-lg mt-8">{service.text}</p>
        <Tags items={service.tags} className="mt-10" />
      </div>
    </Section>
  );
}
