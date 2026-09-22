"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@/lib/cx";
import type { Member } from "@/content/types";

/**
 * One founder: portrait beside the caption. Hovering the portrait (or
 * focusing and tapping it, for keyboards and touch) opens a short profile
 * under the caption; the space is reserved so the section never jumps.
 */
export function TeamMember({ member, sizes }: { member: Member; sizes: string }) {
  const [pinned, setPinned] = useState(false);
  const id = `profile-${member.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return (
    <figure className="group flex items-start gap-6">
      <button
        type="button"
        aria-expanded={pinned}
        aria-controls={id}
        onClick={() => setPinned((v) => !v)}
        className="shrink-0 cursor-pointer text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-forest"
      >
        <Image
          src={member.image}
          alt={member.alt}
          width={1145}
          height={1374}
          sizes={sizes}
          className={cx(
            "portrait h-auto w-[9rem] transition-[filter] duration-300 lg:w-[11rem]",
            "group-hover:grayscale-[0.6]",
            pinned && "grayscale-[0.6]",
          )}
        />
      </button>
      <figcaption className="min-w-0 flex-1">
        <p className="display-lead" data-line-gap>
          {member.name}
        </p>
        <p className="label mt-2 text-charcoal/60">{member.role}</p>
        <p className="body-text mt-4 text-[15px] text-charcoal/80">{member.text}</p>

        <div
          id={id}
          className={cx(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100",
            pinned && "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <ul className="mt-4 border-t border-fog pt-3 text-[13px] leading-snug text-charcoal/75">
              {member.facts.map((fact) => (
                <li key={fact} className="py-1">
                  {fact}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-serif text-[15px] leading-snug">{member.more}</p>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
