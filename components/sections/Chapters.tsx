import Link from "next/link";
import type { ReactNode } from "react";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section } from "@/components/Section";
import { Tags } from "@/components/Tags";
import { ProcessFigure } from "@/components/ProcessFigure";
import type { Service } from "@/content/types";

/**
 * Sections 6 to 9: the four service chapters in one shared layout, all in the
 * left two thirds: hairline and label, the headline with its second paragraph
 * left, the short text with three points and the tags right. A chapter can
 * add one figure under the headline. On desktop the line's stage sits to the right, where the thread
 * is pulled into each chapter's icon as the chapter arrives.
 */
function Chapter({ service, figure }: { service: Service; figure?: ReactNode }) {
  return (
    <Section id={service.slug} narrow>
      <Hairline />
      <p className="label mt-8 flex items-center gap-4" data-line-gap>
        <span className="text-charcoal/60">{service.index}</span>
        <span>{service.name}</span>
      </p>

      <Grid className="mt-20 lg:mt-28">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="display-h2" data-line-gap>
            {service.headline}
          </h2>
          <p className="body-text mt-8 text-charcoal/80 lg:max-w-[30rem]">{service.detail}</p>
          {figure && <div className="mt-14 lg:max-w-[26rem]">{figure}</div>}
        </div>
        <div className="col-span-12 mt-12 lg:col-span-5 lg:col-start-8 lg:mt-2">
          <p className="body-text-lg">{service.text}</p>
          <ul className="mt-10">
            {service.points.map((point) => (
              <li key={point} className="border-t border-fog py-4 text-[15px] leading-snug last:border-b">
                {point}
              </li>
            ))}
          </ul>
          <Tags items={service.tags} className="mt-8" />
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

export function ChapterWebsites({ service }: { service: Service }) {
  return <Chapter service={service} />;
}

export function ChapterAutomationen({ service }: { service: Service }) {
  return <Chapter service={service} />;
}

/** the backoffice chapter keeps its four-step figure under the headline */
export function ChapterBackoffice({ service }: { service: Service }) {
  return <Chapter service={service} figure={<ProcessFigure steps={["Eingang", "Erkennen", "Zuordnen", "Kontrolle"]} />} />;
}

export function ChapterSchulung({ service }: { service: Service }) {
  return <Chapter service={service} />;
}
