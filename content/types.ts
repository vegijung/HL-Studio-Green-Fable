import type { ContactChannel } from "./contact";

export type ServiceSlug =
  | "websites"
  | "automationen"
  | "backoffice"
  | "beratung-schulung";

export interface Link {
  label: string;
  href: string;
}

export interface Service {
  slug: ServiceSlug;
  index: string;
  name: string;
  headline: string;
  text: string;
  tags: string[];
  /** optional inline link under the copy, e.g. the price link of the entry offer */
  link?: Link;
}

export interface Fact {
  value: string;
  label: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface Case {
  sector: string;
  title: string;
  before: Metric;
  after: Metric;
  text: string;
  /** path to a client logo, once real cases replace the examples */
  logo?: string;
}

export interface PriceColumn {
  name: string;
  price: string;
  period: string;
  lead: string;
  features: string[];
  cta: { label: string; solid: boolean };
}

export interface Member {
  name: string;
  role: string;
  text: string;
  image: string;
  alt: string;
}

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export interface SiteContent {
  meta: {
    siteName: string;
    title: string;
    description: string;
  };
  nav: {
    links: Link[];
    cta: string;
  };
  hero: {
    label: string;
    /** newlines mark intended line breaks */
    h1: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: Link;
    tagline: string;
  };
  facts: Fact[];
  services: {
    label: string;
    h2: string;
    text: string;
    items: Service[];
  };
  cases: {
    label: string;
    h2: string;
    text: string;
    items: Case[];
  };
  prices: {
    label: string;
    h2: string;
    text: string;
    columns: PriceColumn[];
    footnote: string;
  };
  team: {
    label: string;
    h2: string;
    text: string;
    members: Member[];
  };
  contact: {
    statement: string;
    text: string;
    cta: string;
    channelLabels: Record<ContactChannel, string>;
  };
  footer: {
    madeIn: string;
    links: Link[];
    copyright: string;
  };
  subpages: {
    back: string;
    servicePriceLink: Link;
    serviceCta: string;
  };
  legal: {
    impressum: LegalPage;
    datenschutz: LegalPage;
  };
}
