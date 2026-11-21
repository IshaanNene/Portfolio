"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { site } from "@/config/site";
import { play } from "@/lib/sound";

const TIPS = [
  "ship something small today.",
  "write it down before you forget it.",
  "read the error message. slowly.",
  "take a walk. the bug will wait.",
  "commit early, commit often.",
  "delete one thing you don't need.",
  "ask the 'dumb' question.",
  "drink some water.",
];

const noop = () => () => {};
/** Today's date in the diary owner's timezone; null during SSR. */
function useToday() {
  return useSyncExternalStore(
    noop,
    () => new Date().toLocaleDateString("en-GB", { timeZone: site.timezone }),
    () => null,
  );
}

/** Desk calendar — tear the page off for a new note-to-self. */
export function TearOffCalendar() {
  const stamp = useToday();
  const [torn, setTorn] = useState(0);
  const date = stamp ? new Date(stamp.split("/").reverse().join("-") + "T12:00:00") : null;
  const month = date?.toLocaleDateString("en-GB", { month: "short" }).toUpperCase() ?? "—";
  const day = date?.getDate() ?? "··";
  const weekday = date?.toLocaleDateString("en-GB", { weekday: "long" }) ?? "today";

  return (
    <div className="relative w-52 select-none">
      {/* binding rings */}
      <div className="absolute -top-2 left-0 right-0 z-20 flex justify-around px-6" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-5 w-3 rounded-full border-[3px] border-ink bg-cream" />
        ))}
      </div>
      {/* stack of pages underneath */}
      <div aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-[3px] border-ink bg-paper" />
      <div aria-hidden className="absolute inset-0 translate-x-0.5 translate-y-0.5 border-[3px] border-ink bg-paper" />
      <button
        type="button"
        onClick={() => {
          play("rip");
          setTorn((t) => t + 1);
        }}
        aria-label="Tear off the calendar page for a new note"
        className="relative block w-full border-[3px] border-ink bg-paper text-left shadow-brutal"
      >
        <span className="block bg-coral pb-1 pt-4 text-center font-display text-lg font-extrabold tracking-[0.3em] text-paper">{month}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={torn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: -40, x: 30, rotate: 18, opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="block px-4 pb-4 pt-2 text-center"
          >
            <span className="block font-display text-7xl font-extrabold leading-none">{day}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">{weekday}</span>
            <span className="mt-3 block border-t-2 border-dashed border-ink/30 pt-2 font-hand text-xl font-bold leading-tight text-electric">
              {TIPS[torn % TIPS.length]}
            </span>
          </motion.span>
        </AnimatePresence>
      </button>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">tear here ↑ for a new note</p>
    </div>
  );
}
