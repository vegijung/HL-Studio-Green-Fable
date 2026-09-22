import { Cta } from "@/components/Cta";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import { cx } from "@/lib/cx";
import type { SiteContent } from "@/content/types";

/** Section 11: four offers in a two-by-two grid separated by fog hairlines, no boxes, no badge */
export function Prices({ content }: { content: SiteContent["prices"] }) {
  return (
    <Section id="preise" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Hairline className="mt-16 lg:mt-20" />

      <div className="grid gap-y-16 sm:grid-cols-2 sm:gap-y-0">
        {content.columns.map((column, i) => (
          <div
            key={column.name}
            className={cx(
              "flex flex-col pt-12 sm:pb-14",
              i % 2 === 1 && "sm:border-l sm:border-fog sm:pl-10",
              i % 2 === 0 && "sm:pr-10",
              i >= 2 && "sm:border-t sm:border-fog",
            )}
          >
            <p className="label">{column.name}</p>
            <p className="display-figure mt-8" data-line-gap>
              {column.price}
            </p>
            <p className="mt-2 text-[14px] text-charcoal/70">{column.period}</p>
            <p className="display-lead mt-10 text-[1.35rem]">{column.lead}</p>

            <ul className="mt-10 flex-1 border-t border-fog">
              {column.features.map((feature) => (
                <li
                  key={feature}
                  className="border-b border-fog py-4 text-[15px] leading-snug text-charcoal/85"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Cta label={column.cta.label} variant={column.cta.solid ? "solid" : "text"} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-16 text-[14px] text-charcoal/70">{content.footnote}</p>
    </Section>
  );
}
