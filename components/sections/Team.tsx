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

      {/* both founders on the same four rows: name, role, text, profile */}
      <div className="mt-12 grid gap-y-10 lg:mt-14 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0">
        <TeamMember member={first} sizes="176px" />
        <TeamMember member={second} sizes="176px" />
      </div>

      <Hairline className="mt-12 lg:mt-14" />
    </Section>
  );
}
