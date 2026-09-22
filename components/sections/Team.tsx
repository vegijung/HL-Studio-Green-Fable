import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import { TeamMember } from "@/components/sections/TeamMember";
import type { SiteContent } from "@/content/types";

/** Section 12: two founders side by side, portrait beside the caption; hovering a portrait opens a short profile. Greyscale on ivory, no frames. */
export function Team({ content }: { content: SiteContent["team"] }) {
  const [first, second] = content.members;
  return (
    <Section id="team" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Grid className="mt-12 items-start lg:mt-14">
        <div className="col-span-12 lg:col-span-6">
          <TeamMember member={first} sizes="176px" />
        </div>
        <div className="col-span-12 mt-10 lg:col-span-6 lg:mt-0">
          <TeamMember member={second} sizes="176px" />
        </div>
      </Grid>

      <Hairline className="mt-12 lg:mt-14" />
    </Section>
  );
}
