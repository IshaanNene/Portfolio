"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { classified } from "@/data/lab";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";

/** A manila folder stamped CLASSIFIED. Unlock via the terminal (`unlock`) or a combination. */
export function Classified() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const on = () => {
      setOpen(true);
      play("stamp");
    };
    window.addEventListener("diary:unlock", on);
    return () => window.removeEventListener("diary:unlock", on);
  }, []);

  const tryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === "1337" || code.trim().toLowerCase() === "unlock") {
      setOpen(true);
      findEgg("classified");
      play("stamp");
    } else {
      setShake((s) => s + 1);
      play("thunk");
    }
    setCode("");
  };

  return (
    <div className="relative">
      <div className="relative ml-4 inline-block border-[3px] border-b-0 border-ink bg-[#e8c98f] px-4 py-1 font-mono text-xs font-bold uppercase">
        LAB-X / do not open
      </div>
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden border-[3px] border-ink bg-[#e8c98f] p-5 shadow-brutal-lg"
      >
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div key="locked" exit={{ rotateX: 80, opacity: 0 }} className="relative">
              <span className="absolute -right-2 top-0 rotate-12 border-4 border-[#c0392b] px-3 py-1 font-display text-2xl font-extrabold uppercase text-[#c0392b] opacity-80">
                Classified
              </span>
              <div className="space-y-2 pt-2 blur-[5px] select-none" aria-hidden>
                <div className="h-3 w-3/4 bg-ink/70" />
                <div className="h-3 w-2/3 bg-ink/70" />
                <div className="h-3 w-5/6 bg-ink/70" />
                <div className="h-3 w-1/2 bg-ink/70" />
              </div>
              <form onSubmit={tryCode} className="mt-5 flex flex-wrap items-center gap-2">
                <Lock className="h-4 w-4" />
                <label htmlFor="code" className="font-mono text-xs uppercase">
                  clearance code
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-28 border-2 border-ink bg-paper px-2 py-1 font-mono text-sm outline-none"
                  autoComplete="off"
                />
                <button className="border-2 border-ink bg-ink px-2 py-1 font-mono text-xs uppercase text-paper">try</button>
              </form>
              <p className="mt-2 font-hand text-lg text-ink-soft">hint: the terminal knows a word for this.</p>
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotateX: -80, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}>
              <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f8a3a]">
                <Unlock className="h-4 w-4" /> clearance granted
              </p>
              <ul className="mt-3 space-y-2">
                {classified.map((c, i) => (
                  <li key={i} className="bg-paper p-2 font-hand text-xl font-semibold leading-tight shadow-[3px_3px_0_rgba(0,0,0,.15)]">
                    {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
