import { cx } from "@/lib/cx";

/**
 * Phase 1 stand-in for the line: a static 1px fog rule where the line will run.
 * Marked with data-line-placeholder so the engine can find and replace them in phase 3.
 */
export function Hairline({
  tone = "fog",
  className,
}: {
  tone?: "fog" | "ivory" | "forest";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-line-placeholder
      className={cx(
        "h-px w-full",
        tone === "fog" && "bg-fog",
        tone === "ivory" && "bg-ivory/30",
        tone === "forest" && "bg-forest",
        className,
      )}
    />
  );
}
