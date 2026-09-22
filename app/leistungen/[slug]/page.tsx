import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/content";
import { Cta } from "@/components/Cta";
import { Subpage } from "@/components/Subpage";
import { Tags } from "@/components/Tags";

const content = getContent();

type Params = Promise<{ slug: string }>;

/** the four service pages are generated statically; unknown slugs are 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return content.services.items.map((service) => ({ slug: service.slug }));
}

function findService(slug: string) {
  return content.services.items.find((service) => service.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = findService((await params).slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.text,
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const service = findService((await params).slug);
  if (!service) notFound();

  return (
    <Subpage
      label={`${service.index} · ${service.name}`}
      title={service.headline}
      back={{ label: content.subpages.back, href: "/#leistungen" }}
    >
      <p className="body-text-lg mt-8">{service.text}</p>
      <p className="body-text mt-6 text-charcoal/80">{service.detail}</p>
      <ul className="mt-10">
        {service.points.map((point) => (
          <li key={point} className="border-t border-fog py-4 text-[15px] leading-snug last:border-b">
            {point}
          </li>
        ))}
      </ul>
      <Tags items={service.tags} className="mt-8" />
      <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4">
        <Cta label={content.subpages.serviceCta} variant="solid" />
        <Link
          href={content.subpages.servicePriceLink.href}
          className="text-[15px] underline decoration-fog underline-offset-[6px] transition-colors hover:decoration-current"
        >
          {content.subpages.servicePriceLink.label}
        </Link>
      </div>
    </Subpage>
  );
}
