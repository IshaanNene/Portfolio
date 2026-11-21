"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { scribbles } from "@/data/scribbles";
import { tilt } from "@/lib/utils";
import { play } from "@/lib/sound";
import { DoodlePad } from "./DoodlePad";

const kindColor = { idea: "#3E5C76", thought: "#171717", observation: "#2f8a3a", unfinished: "#D2693A" } as const;

/** Hand-drawn sketches, SVG-stroked so they "draw themselves" in. */
function Sketch({ kind }: { kind: "server" | "bulb" | "graph" }) {
  const common = { fill: "none", stroke: "#171717", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const draw = { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 1.4, ease: "easeInOut" as const } };
  if (kind === "bulb")
    return (
      <svg viewBox="0 0 120 140" className="h-32 w-28" aria-hidden>
        <motion.path {...common} {...draw} d="M60 10 C 25 10, 15 55, 40 75 C 46 82, 46 92, 46 100 L 74 100 C 74 92, 74 82, 80 75 C 105 55, 95 10, 60 10 Z" />
        <motion.path {...common} {...draw} d="M48 110 H72 M50 120 H70 M56 130 H64" />
        <motion.path {...common} {...draw} stroke="#D9A441" strokeWidth={4} d="M10 30 L22 36 M110 30 L98 36 M60 0 V4 M8 70 L20 66 M112 70 L100 66" />
      </svg>
    );
  if (kind === "graph")
    return (
      <svg viewBox="0 0 180 120" className="h-28 w-44" aria-hidden>
        <motion.path {...common} {...draw} d="M10 10 V110 H170" />
        <motion.path {...common} {...draw} stroke="#D2693A" d="M14 100 C 40 98, 60 90, 80 70 S 120 20, 165 15" />
        <motion.path {...common} {...draw} strokeDasharray="5 6" d="M14 100 L 165 60" />
      </svg>
    );
  return (
    <svg viewBox="0 0 200 120" className="h-28 w-48" aria-hidden>
      <motion.path {...common} {...draw} d="M10 20 h50 v35 h-50 z M140 20 h50 v35 h-50 z M75 80 h50 v30 h-50 z" />
      <motion.path {...common} {...draw} d="M60 37 C 90 30, 110 30, 140 37 M35 55 C 40 80, 60 90, 75 95 M165 55 C 160 80, 140 90, 125 95" />
      <motion.path {...common} {...draw} stroke="#3E5C76" d="M95 60 l5 -8 l5 8" />
    </svg>
  );
}

/** The scribble page: handwritten ideas, crossed-out words, sketches, a doodle pad. */
export function ScribblePage() {
  const [struck, setStruck] = useState<Record<string, boolean>>({});
  return (
    <div className="ruled relative overflow-hidden border-[3px] border-ink bg-[#fbf5e8] p-6 pl-16 shadow-brutal-lg sm:p-10 sm:pl-20">
      {/* binder holes */}
      <div className="absolute left-4 top-0 flex h-full flex-col justify-around" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-6 w-6 rounded-full border-[3px] border-ink bg-cream shadow-[inset_2px_2px_0_rgba(0,0,0,.2)]" />
        ))}
      </div>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {scribbles.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            style={{ rotate: tilt(s.id, 2.5) }}
            className={i % 3 === 1 ? "md:translate-x-6" : ""}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: kindColor[s.kind] }}>
              {s.kind}
            </span>
            <p className="font-hand text-[1.7rem] font-semibold leading-[1.15]">
              {s.crossedOut && (
                <button
                  type="button"
                  onClick={() => {
                    setStruck((o) => ({ ...o, [s.id]: !o[s.id] }));
                    play("tick");
                  }}
                  className="mr-2 text-ink-soft line-through decoration-coral decoration-[3px]"
                  title="un-cross it?"
                  style={{ textDecorationLine: struck[s.id] ? "none" : "line-through" }}
                >
                  {s.crossedOut}
                </button>
              )}
              {s.text}
              {s.kind === "unfinished" && <span className="ml-1 inline-block w-3 animate-blink">_</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-around gap-8">
        <figure className="text-center">
          <Sketch kind="server" />
          <figcaption className="font-hand text-xl">v2 architecture?? (don&rsquo;t show anyone)</figcaption>
        </figure>
        <figure className="text-center">
          <Sketch kind="bulb" />
          <figcaption className="font-hand text-xl">idea @ 2am</figcaption>
        </figure>
        <figure className="text-center">
          <Sketch kind="graph" />
          <figcaption className="font-hand text-xl">expectation vs reality</figcaption>
        </figure>
      </div>

      <div className="mt-12 max-w-2xl">
        <DoodlePad />
      </div>
    </div>
  );
}
