"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { Link as NavLink } from "@/content/types";

/**
 * Fixed nav. Transparent while the hero (data-nav-sentinel) is under it,
 * ivory with a fog hairline afterwards and on subpages. Over the hero the text
 * is charcoal because the photograph's sky is pale at the top; phase 3 switches
 * it to ivory for the dark opening before the photo fades in.
 */
export function Nav({
  logo,
  links,
  cta,
}: {
  logo: ReactNode;
  links: NavLink[];
  cta: { label: string; href: string };
}) {
  const pathname = usePathname();
  const [heroVisible, setHeroVisible] = useState(true);
  // only the scroll page has a hero; subpages are solid from the first paint
  const overHero = pathname === "/" && heroVisible;

  useEffect(() => {
    const hero = document.querySelector("[data-nav-sentinel]");
    if (!hero) return;
    const nav = getComputedStyle(document.documentElement)
      .getPropertyValue("--nav-height")
      .trim();
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: `-${nav || "80px"} 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  const external = cta.href.startsWith("http");

  return (
    <header
      data-nav
      className={cx(
        "fixed inset-x-0 top-0 z-30 h-nav transition-colors duration-300",
        overHero
          ? "border-b border-transparent text-charcoal"
          : "border-b border-fog bg-ivory text-charcoal",
      )}
    >
      <div className="h-full px-6 lg:px-12">
        <div className="mx-auto flex h-full w-full max-w-content items-center justify-between">
          <Link href="/" aria-label="HL Studio, zur Startseite" className="block h-7">
            {logo}
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="label-lg transition-opacity duration-200 hover:opacity-60"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {external ? (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label-lg border border-current px-4 py-3 transition-opacity duration-200 hover:opacity-70"
            >
              {cta.label}
            </a>
          ) : (
            <Link
              href={cta.href}
              className="label-lg border border-current px-4 py-3 transition-opacity duration-200 hover:opacity-70"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
