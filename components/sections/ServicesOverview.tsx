import Link from "next/link";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import type { SiteContent } from "@/content/types";

/** Section 5: label, H2, text and the four service names in one row */
export function ServicesOverview({ content }: { content: SiteContent["services"] }) {
  return (
    <Section id="leistungen">
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <nav aria-label="Leistungen" className="mt-28 lg:mt-36">
        <ul className="flex flex-col gap-y-10 lg:flex-row lg:items-end lg:justify-between lg:gap-x-8">
          {content.items.map((service) => (
            <li key={service.slug}>
              <Link
                href={`#${service.slug}`}
                className="group block transition-opacity duration-200 hover:opacity-60"
              >
                <span className="label block text-charcoal/60">{service.index}</span>
                <span className="display-name mt-3 block" data-line-gap>
                  {service.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Hairline className="mt-10 opacity-60" />
      </nav>
    </Section>
  );
}
