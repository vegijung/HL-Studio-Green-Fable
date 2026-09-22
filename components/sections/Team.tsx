import Image from "next/image";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import type { Member, SiteContent } from "@/content/types";

function Portrait({ member, sizes, priority = false }: { member: Member; sizes: string; priority?: boolean }) {
  return (
    <figure className="flex items-start gap-6">
      <Image
        src={member.image}
        alt={member.alt}
        width={1145}
        height={1374}
        sizes={sizes}
        priority={priority}
        className="portrait h-auto w-[9rem] shrink-0 lg:w-[11rem]"
      />
      <figcaption>
        <p className="display-lead" data-line-gap>
          {member.name}
        </p>
        <p className="label mt-2 text-charcoal/60">{member.role}</p>
        <p className="body-text mt-4 text-[15px] text-charcoal/80">{member.text}</p>
      </figcaption>
    </figure>
  );
}

/** Section 12: two founders side by side, portrait beside the caption, the section one viewport high. Greyscale on ivory, no frames. */
export function Team({ content }: { content: SiteContent["team"] }) {
  const [first, second] = content.members;
  return (
    <Section id="team" narrow>
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Grid className="mt-12 items-start lg:mt-14">
        <div className="col-span-12 lg:col-span-6">
          <Portrait member={first} sizes="176px" />
        </div>
        <div className="col-span-12 mt-10 lg:col-span-6 lg:mt-0">
          <Portrait member={second} sizes="176px" />
        </div>
      </Grid>

      <Hairline className="mt-12 lg:mt-14" />
    </Section>
  );
}
