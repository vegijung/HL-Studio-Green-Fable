import { readFileSync } from "node:fs";
import path from "node:path";
import { cx } from "@/lib/cx";

type Variant = "horizontal" | "stacked" | "monogram";

const files: Record<Variant, string> = {
  horizontal: "hl-studio-logo-horizontal.svg",
  stacked: "hl-studio-logo-stacked.svg",
  monogram: "hl-monogram.svg",
};

const cache = new Map<Variant, string>();

/** reads the SVG once at build time so it renders inline and inherits currentColor */
function svgFor(variant: Variant): string {
  const cached = cache.get(variant);
  if (cached) return cached;
  const svg = readFileSync(
    path.join(process.cwd(), "public", "logo", files[variant]),
    "utf8",
  );
  cache.set(variant, svg);
  return svg;
}

export function Logo({
  variant = "horizontal",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      data-logo
      className={cx("inline-block", className)}
      dangerouslySetInnerHTML={{ __html: svgFor(variant) }}
    />
  );
}
