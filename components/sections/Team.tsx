import Image from "next/image";
import { Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";
import { Section, SectionHead } from "@/components/Section";
import type { Member, SiteContent } from "@/content/types";

function Portrait({ member, sizes, priority = false }: { member: Member; sizes: string; priority?: boolean }) {
  return (
    <figure>
      <Image
        src={member.image}
        alt={member.alt}
        width={1145}
        height={1374}
        sizes={sizes}
        priority={priority}
        className="portrait h-auto w-full"
      />
      <figcaption className="mt-8">
        <p className="display-lead" data-line-gap>
          {member.name}
        </p>
        <p className="label mt-3 text-charcoal/60">{member.role}</p>
        <p className="body-text mt-5 text-[16px] text-charcoal/80">{member.text}</p>
      </figcaption>
    </figure>
  );
}

/** Section 12: two portraits, different sizes, offset baselines. Greyscale on ivory, no frames. */
export function Team({ content }: { content: SiteContent["team"] }) {
  const [first, second] = content.members;
  return (
    <Section id="team">
      <SectionHead label={content.label} title={content.h2} text={content.text} />

      <Grid className="mt-24 items-start lg:mt-32">
        <div className="col-span-8 lg:col-span-5">
          <Portrait member={first} sizes="(min-width: 1024px) 40vw, 66vw" />
        </div>
        <div className="col-span-7 col-start-5 mt-16 lg:col-span-4 lg:col-start-8 lg:mt-40">
          <Portrait member={second} sizes="(min-width: 1024px) 32vw, 58vw" />
        </div>
      </Grid>

      <Hairline anchor="team" className="mt-20 lg:mt-28" />
    </Section>
  );
}
