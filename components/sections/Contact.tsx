import { Container, Grid } from "@/components/Container";
import { Cta } from "@/components/Cta";
import { Footer } from "@/components/Footer";
import { Hairline } from "@/components/Hairline";
import { channelHref, channelValue, secondaryChannels } from "@/lib/contact";
import type { SiteContent } from "@/content/types";

/**
 * Section 13 plus footer: the dark closing. Contact and footer together fill
 * one viewport so the page ends in the light it began in. The ridge anchor
 * sits at 30% of the block, the closing statement below it.
 */
export function Contact({
  content,
  footer,
}: {
  content: SiteContent["contact"];
  footer: SiteContent["footer"];
}) {
  return (
    <div data-tone="dark" className="flex min-h-svh flex-col bg-night text-ivory">
      <section id="kontakt" className="relative flex flex-1 flex-col">
        <Container className="pt-[28svh]">
          <Hairline anchor="contact" shape="ridge" tone="ivory" />

          <Grid className="mt-[13svh] pb-10">
            <div className="col-span-12 lg:col-span-9">
              <p className="display-statement" data-line-gap>
                {content.statement}
              </p>
            </div>
            <div className="col-span-12 mt-8 lg:col-span-6 lg:mt-10">
              <p className="body-text-lg text-ivory/85" data-line-gap>
                {content.text}
              </p>
            </div>
            <div className="col-span-12 mt-8 flex flex-wrap items-center gap-x-10 gap-y-5" data-line-gap>
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
        </Container>
      </section>
      <Footer content={footer} />
    </div>
  );
}
