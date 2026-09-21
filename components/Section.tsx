import type { ReactNode } from "react";
import { Container } from "./Container";
import { cx } from "@/lib/cx";

type Tone = "ivory" | "dark";

/**
 * Vertical frame for one page section: 160px / 208px padding, surface tone.
 * `className` applies to the <section>, `inner` to the content frame.
 * `narrow` keeps the content in the left two thirds on desktop: the right
 * third is the stage where the line sits with its icons.
 */
export function Section({
  id,
  tone = "ivory",
  children,
  className,
  inner,
  narrow = false,
}: {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  inner?: string;
  narrow?: boolean;
}) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cx(
        "relative py-section lg:py-section-lg",
        tone === "dark" && "bg-night text-ivory",
        className,
      )}
    >
      <Container className={inner}>
        {narrow ? <div className="lg:w-[calc(66.666%-1.5rem)]">{children}</div> : children}
      </Container>
    </section>
  );
}

/** label + H2 + text, the standard section opener */
export function SectionHead({
  label,
  title,
  text,
  className,
}: {
  label: string;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cx("max-w-[44rem]", className)}>
      <p className="label mb-6">{label}</p>
      <h2 className="display-h2" data-line-gap>
        {title}
      </h2>
      {text && <p className="body-text-lg mt-8">{text}</p>}
    </div>
  );
}
