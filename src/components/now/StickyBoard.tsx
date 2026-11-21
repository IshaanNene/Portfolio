"use client";

import { useRef } from "react";
import { stickyNotes } from "@/data/updates";
import { StickyNote } from "@/components/diary/StickyNote";
import { Hand } from "@/components/ui/Typography";

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
        <ul className="grid grid-cols-1 gap-6 pt-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {stickyNotes.map((n, i) => (
            <li key={n.id}>
              <StickyNote note={n} index={i} constraints={board} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
