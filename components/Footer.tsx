import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { contact } from "@/content/contact";
import { channelHref } from "@/lib/contact";
import type { SiteContent } from "@/content/types";

/** the footer sits inside the dark closing on the home page and on its own on subpages */
export function Footer({ content }: { content: SiteContent["footer"] }) {
  return (
    <footer className="bg-night text-ivory">
      <Container>
        <div className="flex flex-col gap-16 border-t border-ivory/10 py-12 lg:flex-row lg:items-end lg:justify-between lg:py-14">
          <Logo variant="stacked" className="h-20" />

          <div className="grid gap-x-16 gap-y-10 text-[15px] leading-relaxed text-ivory/80 sm:grid-cols-2 lg:grid-cols-3">
            <address className="not-italic">
              <a href={channelHref("email")} className="block hover:text-ivory">
                {contact.email}
              </a>
              <a href={channelHref("phone")} className="block hover:text-ivory">
                {contact.phone}
              </a>
              <span className="block">{contact.place}</span>
            </address>

            <p className="label-lg pt-1 text-ivory">{content.madeIn}</p>

            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              {content.links.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-ivory">
                  {link.label}
                </Link>
              ))}
              <span className="mt-6 text-ivory/50">{content.copyright}</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
