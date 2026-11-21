"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navItems } from "@/config/nav";
import { site } from "@/config/site";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";

/**
 * Non-WebGL diary (also the server-rendered first paint while the 3D
 * scene streams in). Built with layered DOM so it still feels physical:
 * page-edge stack, cloth cover, taped photo, elastic band.
 */
export function DiaryFallback({ interactive = true, className }: { interactive?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const isSvg = site.photo.endsWith(".svg");

  return (
    <div className={cn("relative mx-auto w-[min(88vw,26rem)] [perspective:1600px]", className)}>
      {/* page stack */}
      <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border-[3px] border-ink bg-[repeating-linear-gradient(0deg,#f4ead6_0_3px,#e6d8bd_3px_4px)]" />
      <div aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-[3px] border-ink bg-[#f4ead6]" />

      {/* contents page (revealed under the cover) */}
      <div className="relative aspect-[5/7] border-[3px] border-ink bg-[#fbf5e8] ruled p-6 pl-16">
        <p className="font-display text-4xl font-extrabold">CONTENTS</p>
        <ol className="mt-6 space-y-1.5">
          {navItems.map((n) => (
            <li key={n.href}>
              <Link href={n.href} tabIndex={open || !interactive ? 0 : -1} className="group flex items-baseline gap-2 font-hand text-2xl font-bold">
                <span className="font-mono text-xs">{n.page}</span>
                <span className="group-hover:highlighter">{n.label}</span>
                <span className="flex-1 border-b-2 border-dotted border-ink/40" />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* cover */}
      <button
        type="button"
        disabled={!interactive}
        onClick={() => {
          setOpen((o) => !o);
          play("paper");
        }}
        aria-expanded={open}
        aria-label={open ? "Close the diary" : "Open the diary"}
        className="absolute inset-0 origin-left border-[3px] border-ink bg-coral text-left shadow-brutal-lg transition-transform duration-700 ease-[var(--ease-paper)] [transform-style:preserve-3d]"
        style={{ transform: open ? "rotateY(-160deg)" : "rotateY(-4deg)" }}
      >
        <span className="absolute inset-y-0 left-0 w-5 bg-ink" />
        <span className="absolute inset-0 [backface-visibility:hidden] p-6 pl-10">
          <span className="font-mono text-[10px] tracking-[0.2em]">VOL. 01 · DEV DIARY · 2026</span>
          <span className="mt-3 block -rotate-1 border-[3px] border-ink bg-sun p-3 shadow-brutal">
            <span className="block font-mono text-[10px]">PROPERTY OF —</span>
            <span className="block font-display text-4xl font-extrabold uppercase leading-[0.85] sm:text-5xl">{site.name}</span>
          </span>
          <span className="mt-3 block max-w-full truncate bg-ink px-2 py-1 font-mono text-[11px] text-paper">{site.role}</span>
          <span className="absolute bottom-16 right-5 w-[44%] rotate-3 border-[3px] border-ink bg-paper p-1.5 pb-6 shadow-brutal">
            <Image src={site.photo} alt={site.photoAlt} width={320} height={400} unoptimized={isSvg} priority className="aspect-[4/5] w-full border-2 border-ink object-cover" />
            <span className="absolute bottom-0.5 left-2 font-hand text-lg font-bold">that&rsquo;s me ↑</span>
          </span>
          <span className="absolute bottom-10 left-9 w-[42%] -rotate-3 bg-[#FFF4B8] p-2 font-hand text-lg font-bold leading-tight shadow-[3px_4px_0_rgba(0,0,0,.25)]">
            {site.coverNote.replace("[PLACEHOLDER] ", "")}
          </span>
          <span
            role="presentation"
            onClick={(e) => {
              e.stopPropagation();
              findEgg("donotpress");
            }}
            className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-[#9E2B20] text-center font-display text-[8px] font-extrabold leading-none text-white outline outline-2 outline-ink"
          >
            DO NOT
            <br />
            PRESS
          </span>
        </span>
        <span className="absolute inset-0 grid place-items-center bg-[#e9d6b4] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="font-hand text-3xl font-bold">this diary belongs to {site.firstName}</span>
        </span>
        {/* elastic band */}
        <span className={cn("absolute inset-y-[-6px] right-[12%] w-3 bg-ink transition-opacity", open && "opacity-0")} />
      </button>
    </div>
  );
}
