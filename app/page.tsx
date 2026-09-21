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
      <LineOverlay />
    </>
  );
}
