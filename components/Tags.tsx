import { Fragment } from "react";

/** service tags as one quiet label line: A · B · C */
export function Tags({ items, className }: { items: string[]; className?: string }) {
  return (
    <p className={`label whitespace-normal text-charcoal/60 ${className ?? ""}`}>
      {items.map((tag, i) => (
        <Fragment key={tag}>
          {i > 0 && <span className="mx-2">·</span>}
          <span className="whitespace-nowrap">{tag}</span>
        </Fragment>
      ))}
    </p>
  );
}
