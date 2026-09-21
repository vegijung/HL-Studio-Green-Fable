import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getContent } from "@/content";
import { Nav } from "@/components/Nav";
import { Logo } from "@/components/Logo";
import { primaryHref } from "@/lib/contact";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const content = getContent();

export const metadata: Metadata = {
  title: {
    default: content.meta.title,
    template: `%s — ${content.meta.siteName}`,
  },
  description: content.meta.description,
};

/* the footer is rendered by the pages: inside the dark closing on the home page, after <Subpage> elsewhere */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de-CH" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Nav
          logo={<Logo variant="horizontal" className="h-7" />}
          links={content.nav.links}
          cta={{ label: content.nav.cta, href: primaryHref() }}
        />
        {children}
      </body>
    </html>
  );
}
