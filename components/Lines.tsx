import { Fragment } from "react";

/** renders a string with `\n` as intended line breaks */
export function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <br />}
    </Fragment>
  ));
}
