import type { LegalPage } from "@/content/types";

export function LegalBody({ page }: { page: LegalPage }) {
  return (
    <>
      <p className="body-text-lg mt-8 text-charcoal/75">{page.intro}</p>
      {page.sections.map((section) => (
        <section key={section.heading} className="mt-14">
          <h2 className="label mb-4">{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} className="body-text text-charcoal/85">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </>
  );
}
