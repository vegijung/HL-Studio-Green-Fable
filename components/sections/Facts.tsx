import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section } from "@/components/Section";
import { FactsRidge } from "@/components/sections/FactsRidge";
import { cx } from "@/lib/cx";
import type { Fact } from "@/content/types";

/**
 * Section 3: six facts annotated along the ridge, like a section drawing.
 * Desktop with the line engine: FactsRidge places them on real peaks and
 * saddles. Otherwise: the static layout, facts alternating above and below a
 * straight hairline with short fog leader lines.
 */
const placement = [
  "col-span-4 col-start-1",
  "col-span-4 col-start-5",
  "col-span-4 col-start-9",
];

function Annotation({ fact, below }: { fact: Fact; below: boolean }) {
  return (
    <div className={cx("flex flex-col", below ? "items-start" : "justify-end")}>
      {below && <span aria-hidden className="mb-6 block h-8 w-px bg-fog" />}
      <p className="display-numeral" data-line-gap>
        {fact.value}
      </p>
      <p className="mt-3 max-w-[22ch] text-[15px] leading-snug text-charcoal/70">{fact.label}</p>
      {!below && <span aria-hidden className="mt-6 block h-8 w-px bg-fog" />}
    </div>
  );
}

export function Facts({ facts }: { facts: Fact[] }) {
  const above = facts.filter((_, i) => i % 2 === 0);
  const below = facts.filter((_, i) => i % 2 === 1);

  return (
    <Section id="fakten" inner="py-8">
      <FactsRidge facts={facts} />

      <div data-facts-static>
        <Grid className="items-end">
          {above.map((fact, i) => (
            <div key={fact.value} className={cx("col-span-6 lg:col-span-4", placement[i])}>
              <Annotation fact={fact} below={false} />
            </div>
          ))}
        </Grid>

        <Hairline />

        <Grid className="items-start">
          {below.map((fact, i) => (
            <div
              key={fact.value}
              className={cx(
                "col-span-6 lg:col-span-4",
                i === 0 && "lg:col-start-3",
                i === 1 && "lg:col-start-7",
                i === 2 && "lg:col-span-2 lg:col-start-11",
              )}
            >
              <Annotation fact={fact} below />
            </div>
          ))}
        </Grid>
      </div>
    </Section>
  );
}
