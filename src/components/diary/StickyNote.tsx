"use client";

import { motion } from "framer-motion";
import { useState, type RefObject } from "react";
import { noteColor, type StickyNoteData } from "@/data/updates";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { cn, tilt } from "@/lib/utils";
import { SampleStamp } from "@/components/ui/Typography";
import { Pin } from "@/components/ui/Decor";

/**
 * Draggable sticky note. Drag it around the board; double-click (or press
 * Enter) to flip it over and read the secret on the back.
 */
export function StickyNote({ note, index, constraints }: { note: StickyNoteData; index: number; constraints: RefObject<HTMLDivElement | null> }) {
  const [flipped, setFlipped] = useState(false);
  const [z, setZ] = useState(index);
  const rot = tilt(note.id, 5);
  const color = noteColor[note.kind];

  const flip = () => {
    setFlipped((f) => !f);
    play("paper");
    if (!flipped && note.secret) findEgg("secretnote");
  };

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={() => {
        setZ(100 + Date.now() % 1000);
        play("paper");
      }}
      whileDrag={{ scale: 1.06, rotate: 0, boxShadow: "14px 16px 0 rgba(0,0,0,.25)" }}
      initial={{ opacity: 0, y: -30, rotate: rot * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 200, damping: 16 }}
      style={{ zIndex: z }}
      className="relative h-52 w-full cursor-grab touch-none [perspective:900px] active:cursor-grabbing sm:h-56"
    >
      <Pin color={index % 2 ? "#3E5C76" : "#D2693A"} className="-top-2" />
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${note.title}: ${note.body}. Press Enter to flip the note.`}
        onDoubleClick={flip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <div
          className="absolute inset-0 flex flex-col p-4 shadow-[6px_8px_0_rgba(0,0,0,.22)] [backface-visibility:hidden]"
          style={{ background: color, clipPath: "polygon(0 0,100% 0,100% 88%,90% 100%,0 100%)" }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{note.kind}</span>
          <span className="mt-1 font-display text-xl font-extrabold uppercase leading-none">{note.title}</span>
          <span className="mt-2 font-hand text-[1.35rem] font-semibold leading-[1.1]">{note.body.replace("[PLACEHOLDER] ", "")}</span>
          {note.body.includes("[PLACEHOLDER]") && <SampleStamp className="mt-auto self-start" />}
          <span className="absolute bottom-0 right-0 h-[12%] w-[10%] bg-black/15" style={{ clipPath: "polygon(0 0,100% 0,0 100%)" }} />
        </div>
        <div
          className={cn("absolute inset-0 flex items-center justify-center p-5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]")}
          style={{ background: color, filter: "brightness(.93)" }}
        >
          <span className="font-hand text-2xl font-bold leading-tight">{note.secret ?? "nothing back here :)"}</span>
        </div>
      </div>
    </motion.div>
  );
}
