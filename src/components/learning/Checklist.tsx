"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { groupMeta, learningItems, type LearningGroup } from "@/data/learning";
import { usePersistentState } from "@/hooks/usePersistentState";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";

const groups = Object.keys(groupMeta) as LearningGroup[];
const tabColor: Record<LearningGroup, string> = { completed: "bg-grass", exploring: "bg-sun", future: "bg-[#a9c3ff]" };

function Check({ on }: { on: boolean }) {
  return (
    <span className="relative grid h-8 w-8 shrink-0 place-items-center" aria-hidden>
      {/* a box drawn by hand, corners not quite meeting */}
      <svg viewBox="0 0 32 32" className="absolute inset-0 h-8 w-8 overflow-visible">
        <path d="M3 4 Q16 2 29 3.5 Q30.5 16 29 29 Q16 30.5 3.5 28.5 Q2 16 4 2" fill="#fffdf5" stroke="#171717" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 32 32" className="absolute -left-1 -top-2 h-11 w-11 overflow-visible">
        <motion.path
          d="M5 17 L13 25 L30 2"
          fill="none"
          stroke="#2f8a3a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />
      </svg>
    </span>
  );
}

/** Pencil tally marks: four strokes, then a slash through each group of five. */
function Tally({ n }: { n: number }) {
  const groups = Math.ceil(n / 5);
  return (
    <span className="flex gap-2" aria-hidden>
      {Array.from({ length: groups }).map((_, g) => {
        const k = Math.min(5, n - g * 5);
        return (
          <svg key={g} viewBox="0 0 30 22" className="h-5 w-7 overflow-visible">
            {Array.from({ length: Math.min(4, k) }).map((_, i) => (
              <path key={i} d={`M${4 + i * 6} 2 Q${5 + i * 6} 11 ${3.5 + i * 6} 20`} stroke="#171717" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ))}
            {k === 5 && <path d="M0 16 L28 5" stroke="#FF755E" strokeWidth="2.4" strokeLinecap="round" />}
          </svg>
        );
      })}
    </span>
  );
}

/** Spiral notebook to-do list. Visitors' ticks are saved in their browser only. */
export function Checklist() {
  const [tab, setTab] = useState<LearningGroup>("exploring");
  const [done, setDone] = usePersistentState<Record<string, boolean>>(
    "diary:learning",
    Object.fromEntries(learningItems.map((i) => [i.id, i.done])),
  );
  const items = learningItems.filter((i) => i.group === tab);
  const total = learningItems.length;
  const finished = learningItems.filter((i) => done[i.id]).length;

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* tabs */}
      <div role="tablist" aria-label="Checklist sections" className="flex gap-1 pl-12">
        {groups.map((g) => (
          <button
            key={g}
            role="tab"
            id={`tab-${g}`}
            aria-selected={tab === g}
            aria-controls={`panel-${g}`}
            onClick={() => {
              setTab(g);
              play("paper");
            }}
            className={cn(
              "border-[3px] border-b-0 border-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase transition-transform sm:text-sm",
              tabColor[g],
              tab === g ? "translate-y-0" : "translate-y-2 opacity-80 hover:translate-y-1",
            )}
          >
            {groupMeta[g].label}
          </button>
        ))}
      </div>

      <div className="relative border-[3px] border-ink bg-[#fbf5e8] shadow-brutal-xl">
        {/* spiral */}
        <div className="absolute -left-4 top-4 bottom-4 flex flex-col justify-between" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="h-3 w-9 rounded-full border-[3px] border-[#6d737c] bg-transparent" />
          ))}
        </div>

        <div className="ruled min-h-[28rem] py-6 pl-16 pr-5 sm:pr-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-hand text-3xl font-bold">{groupMeta[tab].scrawl}</p>
            <p className="flex items-center gap-2 font-mono text-xs uppercase">
              <Tally n={finished} />
              {finished}/{total} done
            </p>
          </div>
          {/* pencil progress */}
          <div className="mt-2 h-3 w-full border-2 border-ink bg-paper" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={finished} aria-label="Learning progress">
            <motion.div className="h-full bg-[repeating-linear-gradient(45deg,#FFD84D_0_6px,#f0c43a_6px_12px)]" animate={{ width: `${(finished / total) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-6 space-y-4"
            >
              {items.map((item) => {
                const on = !!done[item.id];
                return (
                  <li key={item.id}>
                    <label className="group flex cursor-pointer items-start gap-4">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={on}
                        onChange={() => {
                          setDone((d) => ({ ...d, [item.id]: !d[item.id] }));
                          play("tick");
                        }}
                      />
                      <span className="peer-focus-visible:outline-[3px] peer-focus-visible:outline-electric peer-focus-visible:outline-offset-2">
                        <Check on={on} />
                      </span>
                      <span className="min-w-0">
                        <span className={cn("relative font-hand text-[1.7rem] font-semibold leading-tight", on && "text-ink-soft")}>
                          {item.title.replace("[SAMPLE] ", "")}
                          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="pointer-events-none absolute -left-1 top-1/2 h-3 w-[calc(100%+0.5rem)] -translate-y-1/2 overflow-visible" aria-hidden>
                            <motion.path
                              d="M0 7 C 15 2, 30 11, 50 6 S 85 3, 100 8"
                              fill="none"
                              stroke="#FF755E"
                              strokeWidth="3"
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                              initial={false}
                              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                              transition={{ duration: 0.35 }}
                            />
                          </svg>
                        </span>
                        <span className="block font-mono text-xs text-ink-soft">{item.note}</span>
                        {item.resource && (
                          <a href={item.resource.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs underline">
                            {item.resource.label}
                          </a>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <span aria-hidden />
            <button
              onClick={() => setDone(Object.fromEntries(learningItems.map((i) => [i.id, i.done])))}
              className="font-mono text-[11px] uppercase underline decoration-dotted underline-offset-4"
            >
              reset my ticks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
