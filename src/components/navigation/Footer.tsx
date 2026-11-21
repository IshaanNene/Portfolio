"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/config/site";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { PaperClip } from "@/components/ui/Decor";

export function Footer() {
  const [clicks, setClicks] = useState(0);
  const loose = clicks >= 3;

  return (
    <footer className="relative mt-24 border-t-[3px] border-dashed border-ink/50 px-5 pb-28 pt-8 md:pb-10 md:pr-28">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-hand text-3xl font-bold leading-none">
            this diary belongs to <span className="highlighter">{site.name}</span>
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            hand-built with next.js · three.js · way too much tape
          </p>
        </div>
        <div className="flex items-end gap-3">
          {loose && (
            <Link href="/back-page" className="font-hand text-xl font-bold underline decoration-coral decoration-2 underline-offset-4">
              p.s. there&rsquo;s a back page →
            </Link>
          )}
          <button
            type="button"
            aria-label={loose ? "Paperclip (it fell off)" : "A loose paperclip"}
            onClick={() => {
              const n = clicks + 1;
              setClicks(n);
              play("tick");
              if (n === 3) findEgg("paperclip");
            }}
            className="transition-transform duration-300"
            style={{ transform: `rotate(${loose ? 70 : clicks * 12}deg) translateY(${loose ? 10 : 0}px)` }}
          >
            <PaperClip />
          </button>
        </div>
      </div>
    </footer>
  );
}
