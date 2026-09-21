/**
 * Four-step process figure in hairlines, same stroke language as the line:
 * one horizontal rule with four open nodes sitting on it, index and name under each.
 */
export function ProcessFigure({ steps }: { steps: string[] }) {
  const columns = { gridTemplateColumns: `repeat(${steps.length}, 1fr)` };
  return (
    <figure aria-label={steps.join(" → ")} className="w-full">
      <div className="relative h-3">
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fog" />
        <div aria-hidden className="relative grid h-full" style={columns}>
          {steps.map((step) => (
            <div key={step} className="flex justify-center">
              <span className="block size-3 rounded-full border-[1.5px] border-charcoal bg-ivory" />
            </div>
          ))}
        </div>
      </div>
      <ol className="mt-8 grid" style={columns}>
        {steps.map((step, i) => (
          <li key={step} className="flex flex-col items-center text-center">
            <span className="label text-charcoal/60">{String(i + 1).padStart(2, "0")}</span>
            <span className="mt-2 text-[15px]">{step}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
