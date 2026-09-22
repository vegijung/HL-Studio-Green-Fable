import Image from "next/image";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import { cx } from "@/lib/cx";
import type { Case, Metric, SiteContent } from "@/content/types";

function Figure({ metric, align }: { metric: Metric; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="display-figure whitespace-nowrap text-[1.7rem]" data-line-gap>
        {metric.value}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-snug text-charcoal/70">{metric.label}</p>
    </div>
  );
}

/** before → after, set on a hairline that acts as the axis */
function BeforeAfter({ item }: { item: Case }) {
  return (
    <div className="flex items-start gap-4">
      <Figure metric={item.before} align="left" />
      <div aria-hidden className="relative mt-3.5 flex flex-1 items-center">
        <Hairline />
        <svg viewBox="0 0 8 12" width="8" height="12" className="-ml-px shrink-0 text-fog" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M1 1l6 5-6 5" />
        </svg>
      </div>
      <Figure metric={item.after} align="right" />
    </div>
  );
}

/**
 * Section 10: three cases side by side, no cards, separated by fog hairlines
 * so the section fits one viewport. Built so a logo can replace the sector
 * label later.
 */
export function Cases({ content }: { content: SiteContent["cases"] }) {
  return (
    <Section id="cases" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Hairline className="mt-12 lg:mt-14" />
      {/* subgrid: sector, title, text, figures and result share one row each across the three columns */}
      <ol className="grid gap-y-10 sm:grid-cols-3 sm:gap-y-0">
        {content.items.map((item, i) => (
          <li
            key={item.title}
            className={cx(
              "flex flex-col pt-8 sm:grid sm:grid-rows-subgrid sm:row-span-5",
              i > 0 && "sm:border-l sm:border-fog sm:pl-6",
              i < 2 && "sm:pr-6",
            )}
          >
            {item.logo ? (
              <Image src={item.logo} alt={item.sector} width={120} height={40} className="h-6 w-auto" data-line-gap />
            ) : (
              <p className="label text-charcoal/60" data-line-gap>
                {item.sector}
              </p>
            )}
            <h3 className="mt-5 font-serif text-[1.3rem] leading-snug tracking-[-0.01em]" data-line-gap>
              {item.title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-charcoal/80" data-line-gap>
              {item.text}
            </p>
            <div className="mt-6 self-end border-t border-fog pt-5">
              <BeforeAfter item={item} />
            </div>
            <p className="mt-5 font-serif text-[1rem] leading-snug" data-line-gap>
              {item.result}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
