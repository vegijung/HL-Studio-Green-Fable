import { getContent } from "@/content";
import { LineOverlay } from "@/components/line/LineOverlay";
import { Hero } from "@/components/sections/Hero";
import { Facts } from "@/components/sections/Facts";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import {
  ChapterAutomationen,
  ChapterBackoffice,
  ChapterSchulung,
  ChapterWebsites,
} from "@/components/sections/Chapters";
import { Cases } from "@/components/sections/Cases";
import { Prices } from "@/components/sections/Prices";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  const c = getContent();
  const [websites, automationen, backoffice, schulung] = c.services.items;

  return (
    <>
      <main>
        <Hero content={c.hero} />
        <Facts facts={c.facts} />
        <ServicesOverview content={c.services} />
        <ChapterWebsites service={websites} />
        <ChapterAutomationen service={automationen} />
        <ChapterBackoffice service={backoffice} />
        <ChapterSchulung service={schulung} />
        <Cases content={c.cases} />
        <Prices content={c.prices} />
        <Team content={c.team} />
        <Contact content={c.contact} footer={c.footer} />
      </main>
      {/* the stage: the fixed spot on the right third where the line sits with its icons through the middle of the page */}
      <div
        aria-hidden
        data-line-stage
        data-line-stage-from="leistungen"
        className="pointer-events-none fixed top-1/2 hidden h-[240px] -translate-y-1/2 lg:block"
        style={{
          left: "calc(50vw + 0.2 * min(1280px, 100vw - 96px))",
          width: "calc(0.3 * min(1280px, 100vw - 96px))",
        }}
      />
      <LineOverlay />
    </>
  );
}
