import { cx } from "@/lib/cx";

/**
 * A static 1px rule where the line runs. Two jobs:
 *   - below 1024px and under reduced motion it is the visible line
 *   - on desktop the engine hides it and, if `anchor` is set, uses its position
 *     as the anchor the line rides through this section
 */
export function Hairline({
  tone = "fog",
  className,
  anchor,
  shape = "straight",
  opacity = 1,
  transition,
  pin,
  pinTarget,
  pinAt,
  rideTop,
}: {
  tone?: "fog" | "ivory" | "forest";
  className?: string;
  /** unique name; makes this rule an anchor for the line engine */
  anchor?: string;
  /** shape the line takes while riding this anchor */
  shape?: "ridge" | "ridge-facts" | "straight";
  /** stroke opacity while riding this anchor */
  opacity?: number;
  /** how the morph into this anchor's shape travels along the thread */
  transition?: "ltr" | "outside-in";
  /** pin the section for this scroll distance when the line reaches the anchor (e.g. "60%") */
  pin?: string;
  pinTarget?: string;
  /** viewport height fraction at which the anchor sits when the pin starts (default: the ride top) */
  pinAt?: number;
  /** viewport height fraction where the line stops riding this anchor (default 0.22) */
  rideTop?: number;
}) {
  return (
    <div
      aria-hidden
      data-line-placeholder
      data-line-anchor={anchor}
      data-line-shape={anchor ? shape : undefined}
      data-line-opacity={anchor ? opacity : undefined}
      data-line-transition={anchor ? transition : undefined}
      data-line-pin={anchor ? pin : undefined}
      data-line-pin-target={anchor ? pinTarget : undefined}
      data-line-pin-at={anchor && pinAt !== undefined ? pinAt : undefined}
      data-line-ride-top={anchor && rideTop !== undefined ? rideTop : undefined}
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
