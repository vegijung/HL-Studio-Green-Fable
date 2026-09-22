import Link from "next/link";
import { ICON_FOR_SERVICE } from "@/lib/line/icons";
import { Section, SectionHead } from "@/components/Section";
import type { SiteContent } from "@/content/types";

/**
 * Section 5: label, H2, text and the four service names as large serif words.
 * Content stays in the left two thirds; the line's stage sits to the right, and
 * hovering a name pulls the thread there into that service's icon.
 */
export function ServicesOverview({ content }: { content: SiteContent["services"] }) {
  return (
    <Section id="leistungen" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <nav aria-label="Leistungen" className="mt-12 lg:mt-14">
        <ul className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {content.items.map((service) => (
            <li key={service.slug}>
              <Link
                href={`#${service.slug}`}
                data-line-hover-icon={ICON_FOR_SERVICE[service.slug]}
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
      </nav>

      {/* why HL Studio: four short points, quiet, under the names */}
      <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {content.usps.map((usp) => (
          <li key={usp.title} className="border-t border-fog pt-4 sm:grid sm:grid-rows-subgrid sm:row-span-2">
            <p className="label" data-line-gap>
              {usp.title}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-charcoal/75">{usp.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
