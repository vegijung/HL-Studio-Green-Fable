import type { Metadata } from "next";
import { getContent } from "@/content";
import { Subpage } from "@/components/Subpage";
import { LegalBody } from "@/components/LegalBody";

const content = getContent();

export const metadata: Metadata = {
  title: content.legal.impressum.title,
};

export default function ImpressumPage() {
  return (
    <Subpage
      title={content.legal.impressum.title}
      back={{ label: content.subpages.back, href: "/" }}
    >
      <LegalBody page={content.legal.impressum} />
    </Subpage>
  );
}
