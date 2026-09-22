import Image from "next/image";
import { Container, Grid } from "@/components/Container";
import { Cta } from "@/components/Cta";
import { Footer } from "@/components/Footer";
import ridge from "@/content/ridge.json";
import { channelHref, channelValue, secondaryChannels } from "@/lib/contact";
import type { SiteContent } from "@/content/types";

/**
 * Section 13 plus footer: the closing. The page ends where it began: the
 * photograph fills a viewport again and the line is the whole ridge on it,
 * the closing statement below the ridge. On desktop the engine grows its
 * stage window into this box (`data-line-photo`) and only then shows the
 * picture in the flow (`--photo-show`); without the engine it is simply there.
 */
export function Contact({
  content,
  footer,
}: {
  content: SiteContent["contact"];
  footer: SiteContent["footer"];
}) {
  return (
    <div data-tone="dark" className="bg-night text-ivory">
      <section id="kontakt" data-line-photo className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        <div aria-hidden data-photo-box className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={`/hero/${ridge.source}`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* the copy starts below the ridge: 44% of the viewport, or lower if the engine measures the ridge lower on the left */}
        <Container className="relative z-20 pb-16" style={{ marginTop: "max(44svh, var(--ridge-clear, 0px))" }}>
          <Grid>
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
