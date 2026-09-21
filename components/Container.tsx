import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Horizontal frame: 1280px content width, 24px / 48px side gutters.
 * Sits at z-20 so text always stays above the line overlay (z-10).
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative z-20 px-6 lg:px-12">
      <div className={cx("mx-auto w-full max-w-content", className)}>
        {children}
      </div>
    </div>
  );
}

/** 12-column grid with 24px gutters */
export function Grid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("grid grid-cols-12 gap-x-6", className)}>{children}</div>
  );
}
