import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Grid } from "@/components/Container";
import { Hairline } from "@/components/Hairline";

/**
 * Shell for /impressum, /datenschutz and /leistungen/[slug]:
 * ivory surface, nav clearance, and a static forest rule as the line's header version.
 */
export function Subpage({
  label,
  title,
  back,
  children,
}: {
  label?: string;
  title: string;
  back: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <main className="pt-nav">
      <Container>
        <div className="pt-16 lg:pt-24">
          <Hairline tone="forest" className="h-[1.5px]" />
        </div>
        <Grid className="pb-section pt-16 lg:pb-section-lg lg:pt-24">
          <div className="col-span-12 lg:col-span-3">
            <Link
              href={back.href}
              className="label transition-opacity duration-200 hover:opacity-60"
            >
              ← {back.label}
            </Link>
          </div>
          <article className="col-span-12 mt-12 lg:col-span-7 lg:col-start-5 lg:mt-0">
            {label && <p className="label mb-6 text-charcoal/60">{label}</p>}
            <h1 className="display-h2" data-line-gap>
              {title}
            </h1>
            {children}
          </article>
        </Grid>
      </Container>
    </main>
  );
}
