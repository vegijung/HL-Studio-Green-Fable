import { Grid } from "@/components/Container";
import { Cta } from "@/components/Cta";
import { Hairline } from "@/components/Hairline";
import { Section } from "@/components/Section";
import { channelHref, channelValue, secondaryChannels } from "@/lib/contact";
import type { SiteContent } from "@/content/types";

/**
 * Section 13: return and contact on the dark surface.
 * The ridge sits in the upper third (phase 3); phase 1 keeps that space with an ivory hairline.
 */
export function Contact({ content }: { content: SiteContent["contact"] }) {
  return (
    <Section id="kontakt" tone="dark" className="pb-32 lg:pb-40">
      <div className="pt-[18vh]">
        <Hairline tone="ivory" />
      </div>

      <Grid className="mt-[14vh]">
        <div className="col-span-12 lg:col-span-9">
          <p className="display-statement" data-line-gap>
            {content.statement}
          </p>
        </div>
        <div className="col-span-12 mt-12 lg:col-span-6 lg:mt-16">
          <p className="body-text-lg text-ivory/85">{content.text}</p>
        </div>
        <div className="col-span-12 mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
          <Cta label={content.cta} variant="solid" />
          {secondaryChannels().map((channel) => (
            <a
              key={channel}
              href={channelHref(channel)}
              className="text-[15px] text-ivory/80 underline decoration-ivory/30 underline-offset-[6px] transition-colors hover:text-ivory hover:decoration-ivory"
              {...(channel === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {content.channelLabels[channel]}: {channelValue(channel)}
            </a>
          ))}
        </div>
      </Grid>
    </Section>
  );
}
