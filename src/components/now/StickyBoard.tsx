"use client";

import { useRef } from "react";
import { noteColor, stickyNotes } from "@/data/updates";
import { StickyNote } from "@/components/diary/StickyNote";
import { Hand } from "@/components/ui/Typography";
import { PushPin, ScrapbookLabel } from "@/components/scrapbook/pieces";
import { DragSticky } from "@/components/scrapbook/interactive";

/* a messy, hand-pinned layout: each note sits a little off the grid */
const OFFSETS = [0, 26, -6, 14, 38, 4, 20, -2, 30];

export function StickyBoard() {
  const board = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div className="absolute -top-9 right-2 rotate-2 text-ink sm:-top-10 sm:right-10">
        <Hand className="text-2xl">drag me around · double-click to flip ↓</Hand>
      </div>
      <div
        ref={board}
        className="cork relative overflow-hidden border-[3px] border-ink p-5 shadow-brutal-lg sm:p-8"
        style={{ boxShadow: "inset 0 0 0 10px #8a5a2b, inset 0 0 0 13px #171717, 8px 8px 0 #171717" }}
      >
        {/* status key pinned along the top of the board */}
        <div className="relative mb-8 flex flex-wrap items-center gap-3 pl-2 pt-2">
          <PushPin className="absolute -left-1 -top-2" color="#477BFF" />
          <ScrapbookLabel kind="date" rotate={-3}>
            this week
          </ScrapbookLabel>
          {(Object.keys(noteColor) as (keyof typeof noteColor)[]).map((k, i) => (
            <span
              key={k}
              className="border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_#171717]"
              style={{ background: noteColor[k], transform: `rotate(${(i % 2 ? 1 : -1) * (1 + i)}deg)` }}
            >
              {k}
            </span>
          ))}
        </div>
        <ul className="grid grid-cols-1 gap-6 pt-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {stickyNotes.map((n, i) => (
            <li key={n.id} className="sm:[margin-top:var(--off)]" style={{ ["--off" as string]: `${OFFSETS[i % OFFSETS.length]}px` }}>
              <StickyNote note={n} index={i} constraints={board} />
            </li>
          ))}
        </ul>
        {/* a couple of loose notes slapped on top */}
        <div className="pointer-events-none mt-8 flex flex-wrap justify-end gap-6 [&>*]:pointer-events-auto">
          <DragSticky bounds={board} color="pink" rotate={-5}>
            ask me what I&rsquo;m stuck on
          </DragSticky>
          <DragSticky bounds={board} color="blue" rotate={4}>
            don&rsquo;t forget: write it down
          </DragSticky>
        </div>
      </div>
    </div>
  );
}
