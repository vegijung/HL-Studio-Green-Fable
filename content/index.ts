import { de } from "./de";
import type { SiteContent } from "./types";

/**
 * Site languages. German is the only one for now; `en` is added by
 * creating `content/en.ts` and registering it here.
 */
export const locales = ["de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

const contentByLocale: Record<Locale, SiteContent> = { de };

export function getContent(locale: Locale = defaultLocale): SiteContent {
  return contentByLocale[locale];
}

export type { SiteContent } from "./types";
