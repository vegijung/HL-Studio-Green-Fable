import Image from "next/image";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import type { Case, Metric, SiteContent } from "@/content/types";

function Figure({ metric, align }: { metric: Metric; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="display-figure" data-line-gap>
        {metric.value}
      </p>
      <p className="mt-2 text-[14px] leading-snug text-charcoal/60">{metric.label}</p>
    </div>
  );
}

/** before → after, set on a hairline that acts as the axis (the line, in phase 3) */
function BeforeAfter({ item, index }: { item: Case; index: number }) {
  return (
    <div className="flex items-start gap-6">
      <Figure metric={item.before} align="left" />
      <div aria-hidden className="relative mt-4 flex flex-1 items-center">
        <Hairline anchor={`case-${index + 1}`} opacity={0.4} />
        <svg
          viewBox="0 0 8 12"
          width="8"
          height="12"
          className="-ml-px shrink-0 text-fog"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M1 1l6 5-6 5" />
        </svg>
      </div>
      <Figure metric={item.after} align="right" />
    </div>
  );
}

/** Section 10: three rows, not cards. Built so a logo can replace the sector label later. */
export function Cases({ content }: { content: SiteContent["cases"] }) {
  return (
    <Section id="cases">
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <ol className="mt-24 lg:mt-32">
        {content.items.map((item) => (
          <li key={item.title} className="border-t border-fog py-14 last:border-b lg:py-16">
            <Grid className="gap-y-8">
              <div className="col-span-12 lg:col-span-3">
                {item.logo ? (
                  <Image src={item.logo} alt={item.sector} width={120} height={40} className="h-8 w-auto" data-line-gap />
                ) : (
                  <p className="label text-charcoal/60" data-line-gap>
                    {item.sector}
                  </p>
                )}
              </div>
              <div className="col-span-12 lg:col-span-4">
                <h3 className="display-lead" data-line-gap>
                  {item.title}
                </h3>
                <p className="body-text mt-6 text-[16px] text-charcoal/80" data-line-gap>
                  {item.text}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <BeforeAfter item={item} index={content.items.indexOf(item)} />
              </div>
            </Grid>
          </li>
        ))}
      </ol>
    </Section>
  );
}
