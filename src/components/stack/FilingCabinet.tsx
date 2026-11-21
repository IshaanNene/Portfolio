"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { drawers, levelLabel, type Skill } from "@/data/skills";
import { play } from "@/lib/sound";
import { cn, tilt } from "@/lib/utils";
import { BrandIcon } from "@/components/diary/Polaroid";

const levelColor = { daily: "#9DDC8B", comfortable: "#FFD84D", learning: "#a9c3ff" } as const;

function IndexCard({ skill, i }: { skill: Skill; i: number }) {
  return (
    <motion.li
      initial={{ y: 60, opacity: 0, rotate: 0 }}
      animate={{ y: 0, opacity: 1, rotate: tilt(skill.name, 3) }}
      exit={{ y: 40, opacity: 0 }}
      whileHover={{ y: -14, rotate: 0, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.12 + i * 0.04 }}
      className="relative flex min-h-40 flex-col border-[3px] border-ink bg-paper p-3 shadow-brutal"
      style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 22px, rgba(71,123,255,.2) 22px 23px)", backgroundPosition: "0 34px" }}
    >
      <span className="absolute inset-x-0 top-[33px] h-[2px] bg-coral/70" aria-hidden />
      <div className="flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink"
          style={{ background: skill.icon ? `#${skill.icon.hex}` : "#171717", color: skill.icon && isLight(skill.icon.hex) ? "#171717" : "#fff" }}
        >
          {skill.icon ? <BrandIcon path={skill.icon.path} className="h-5 w-5" /> : <span className="font-display text-xs font-extrabold">{skill.name.slice(0, 2)}</span>}
        </span>
        <span className="font-display text-base font-extrabold uppercase leading-none">{skill.name}</span>
      </div>
      <p className="mt-4 font-hand text-xl leading-[23px]">{skill.note.replace("[SAMPLE] ", "")}</p>
      <span className="mt-auto self-start border-2 border-ink px-1.5 font-mono text-[10px] uppercase" style={{ background: levelColor[skill.level] }}>
        {levelLabel[skill.level]}
      </span>
    </motion.li>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

/** A steel filing cabinet; each drawer slides out to reveal index cards. */
export function FilingCabinet() {
  const [open, setOpen] = useState<string | null>(drawers[0].id);

  return (
    <div className="mx-auto max-w-5xl">
      {/* cabinet top */}
      <div className="relative mx-3 h-6 border-[3px] border-b-0 border-ink bg-[#b9bec6]" aria-hidden>
        <span className="absolute -top-14 left-10 h-14 w-10 rotate-6 border-[3px] border-ink bg-electric" />
        <span className="absolute -top-10 left-24 h-10 w-24 -rotate-3 border-[3px] border-ink bg-paper" />
      </div>
      <div className="border-[3px] border-ink bg-[#a8aeb7] p-3 shadow-brutal-xl sm:p-4" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,.18), transparent 30%, transparent 70%, rgba(0,0,0,.08))" }}>
        <ul className="space-y-3">
          {drawers.map((d) => {
            const isOpen = open === d.id;
            return (
              <li key={d.id}>
                <motion.button
                  type="button"
                  onClick={() => {
                    setOpen(isOpen ? null : d.id);
                    play("thunk");
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`drawer-${d.id}`}
                  animate={{ y: isOpen ? 8 : 0, scale: isOpen ? 1.015 : 1 }}
                  whileHover={{ x: 3 }}
                  className="relative flex w-full items-center gap-4 border-[3px] border-ink bg-[#c9ced5] px-4 py-3 text-left shadow-[inset_0_-6px_0_rgba(0,0,0,.12)] sm:py-4"
                >
                  {/* label holder */}
                  <span className="relative grid min-w-0 flex-1 place-items-center">
                    <span className="flex w-full max-w-xs items-center justify-center gap-2 border-[3px] border-ink px-3 py-1" style={{ background: d.color }}>
                      <span className="font-mono text-[10px] font-bold">{d.code}</span>
                      <span className="truncate font-display text-lg font-extrabold uppercase sm:text-xl">{d.label}</span>
                    </span>
                  </span>
                  {/* handle */}
                  <span className="absolute left-1/2 top-[calc(100%-14px)] hidden h-3 w-24 -translate-x-1/2 rounded-b-md border-[3px] border-t-0 border-ink bg-[#6d737c] sm:block" aria-hidden />
                  <span className="font-mono text-xs font-bold">{d.skills.length} cards</span>
                  <span className={cn("grid h-7 w-7 place-items-center border-2 border-ink bg-paper font-bold transition-transform", isOpen && "rotate-45")} aria-hidden>
                    +
                  </span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`drawer-${d.id}`}
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 24 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-2 border-[3px] border-t-0 border-ink bg-[#8e949c] p-4 shadow-[inset_0_14px_14px_-10px_rgba(0,0,0,.5)] sm:mx-5">
                        <p className="mb-4 font-hand text-2xl font-bold text-paper">{d.description.replace("[SAMPLE] ", "")}</p>
                        <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {d.skills.map((s, i) => (
                            <IndexCard key={s.name} skill={s} i={i} />
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mx-6 flex justify-between" aria-hidden>
        <span className="h-4 w-8 border-[3px] border-t-0 border-ink bg-[#6d737c]" />
        <span className="h-4 w-8 border-[3px] border-t-0 border-ink bg-[#6d737c]" />
      </div>
    </div>
  );
}
