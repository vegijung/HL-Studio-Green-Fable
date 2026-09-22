"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@/lib/cx";
import type { Member } from "@/content/types";

/**
 * One founder: portrait beside the caption. Hovering the portrait (or
 * focusing and tapping it, for keyboards and touch) opens a short profile
 * under the caption. On desktop the room is reserved so the page never
 * jumps; on smaller screens the profile unfolds. The caption's four pieces
 * sit on rows shared with the other founder (subgrid), so names, roles and
 * texts line up across the two columns.
 */
export function TeamMember({ member, sizes }: { member: Member; sizes: string }) {
  const [pinned, setPinned] = useState(false);
  const id = `profile-${member.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return (
    <div className="group grid grid-cols-[9rem_1fr] gap-x-6 lg:grid-cols-[11rem_1fr] lg:grid-rows-subgrid lg:row-span-4">
      <button
        type="button"
        aria-expanded={pinned}
        aria-controls={id}
        onClick={() => setPinned((v) => !v)}
        className="row-span-4 cursor-pointer self-start text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-forest"
      >
        <Image
          src={member.image}
          alt={member.alt}
          width={1145}
          height={1374}
          sizes={sizes}
          className={cx(
            "portrait h-auto w-full transition-[filter] duration-300",
            "group-hover:grayscale-[0.6]",
            pinned && "grayscale-[0.6]",
          )}
        />
      </button>
      <p className="font-serif text-[1.4rem] leading-tight tracking-[-0.01em]" data-line-gap>
        {member.name}
      </p>
      <p className="label mt-2 text-charcoal/60">{member.role}</p>
      <p className="body-text mt-4 text-[15px] text-charcoal/80">{member.text}</p>

      <div
        id={id}
        className={cx(
          "grid transition-[grid-template-rows] duration-300 ease-out lg:grid-rows-[1fr]",
          "grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]",
          pinned && "grid-rows-[1fr]",
        )}
      >
        <div
          className={cx(
            "min-h-0 overflow-hidden transition-[opacity,transform] duration-300 ease-out",
            "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
            pinned && "translate-y-0 opacity-100",
          )}
        >
          <p className="mt-4 border-t border-fog pt-3 text-[12.5px] leading-snug text-charcoal/75">{member.facts.join(" · ")}</p>
          <p className="mt-3 font-serif text-[14px] leading-snug">{member.more}</p>
        </div>
      </div>
    </div>
  );
}
