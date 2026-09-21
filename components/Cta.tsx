import Link from "next/link";
import { primaryHref } from "@/lib/contact";
import { cx } from "@/lib/cx";

type Variant = "solid" | "text" | "outline";

/**
 * Call to action. Without `href` it opens the primary contact channel
 * from content/contact.ts. `solid` is the forest button, `text` a link with arrow.
 */
export function Cta({
  label,
  href,
  variant = "solid",
  className,
}: {
  label: string;
  href?: string;
  variant?: Variant;
  className?: string;
}) {
  const target = href ?? primaryHref();
  const external = target.startsWith("http");
  const cls = cx(
    "group inline-flex items-center gap-2 font-sans text-[15px] leading-none transition-opacity duration-200 hover:opacity-80",
    variant === "solid" && "bg-forest px-6 py-4 text-ivory",
    variant === "outline" && "border border-current px-5 py-3",
    variant === "text" && "underline decoration-fog underline-offset-[6px] hover:decoration-current",
    className,
  );
  const inner = (
    <>
      <span>{label}</span>
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </>
  );
  if (external) {
    return (
      <a href={target} className={cls} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link href={target} className={cls}>
      {inner}
    </Link>
  );
}
