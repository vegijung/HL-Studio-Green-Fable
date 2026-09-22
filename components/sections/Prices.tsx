import { Cta } from "@/components/Cta";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import { cx } from "@/lib/cx";
import type { SiteContent } from "@/content/types";

/** Section 11: four offers in one row separated by fog hairlines, no boxes, no badge; the whole section fits one viewport */
export function Prices({ content }: { content: SiteContent["prices"] }) {
  return (
    <Section id="preise" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Hairline className="mt-12 lg:mt-14" />

      <div className="grid gap-y-12 sm:grid-cols-2 sm:gap-y-0 lg:grid-cols-4">
        {content.columns.map((column, i) => (
          <div
            key={column.name}
            className={cx(
              "flex flex-col pt-7",
              i % 2 === 1 && "sm:border-l sm:border-fog sm:pl-6",
              i % 2 === 0 && "sm:pr-6",
              i >= 2 && "sm:border-t sm:border-fog lg:border-t-0",
              i === 2 && "lg:border-l lg:border-fog lg:pl-6",
              i === 3 && "lg:pr-0",
            )}
          >
            <p className="label">{column.name}</p>
            <p className="display-figure mt-4 text-[1.9rem]" data-line-gap>
              {column.price}
            </p>
            <p className="mt-1 text-[12.5px] text-charcoal/70">{column.period}</p>
            <p className="mt-4 font-serif text-[1.05rem] leading-snug">{column.lead}</p>

            <ul className="mt-4 flex-1 border-t border-fog">
              {column.features.map((feature) => (
                <li key={feature} className="border-b border-fog py-2 text-[13px] leading-snug text-charcoal/85">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* one booking per section: the offers share a single call to action */}
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Cta label={content.columns[0].cta.label} variant="solid" />
        <p className="text-[13px] text-charcoal/70">{content.footnote}</p>
      </div>
    </Section>
  );
}
