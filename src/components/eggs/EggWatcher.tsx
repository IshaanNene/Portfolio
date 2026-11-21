"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EGGS, findEgg, type EggEvent, type EggId } from "@/lib/eggs";
import { play } from "@/lib/sound";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const total = Object.keys(EGGS).length;

/**
 * Site-wide easter-egg listeners + the little toast that announces a find.
 *  • Konami code → the hidden back page
 *  • typing "coffee" anywhere → coffee stain
 *  • a hello for people who open devtools
 */
export function EggWatcher() {
  const router = useRouter();
  const [toast, setToast] = useState<{ id: EggId; key: number } | null>(null);
  const [stains, setStains] = useState<{ x: number; y: number; r: number; key: number }[]>([]);

  useEffect(() => {
    console.log(
      "%c psst. %c\nYou opened the back of the diary.\nThere are " + total + " easter eggs on this site. Try the Lab terminal → `secret`.",
      "background:#FFD84D;color:#171717;font:900 18px sans-serif;padding:4px 8px;border:3px solid #171717",
      "font:14px monospace",
    );
  }, []);

  useEffect(() => {
    let k = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) {
        k = 0;
        findEgg("konami");
        setTimeout(() => router.push("/back-page"), 700);
      }
      if (typing || e.key.length !== 1) return;
      typed = (typed + key).slice(-6);
      if (typed === "coffee") {
        typed = "";
        findEgg("coffee");
        setStains((s) => [
          ...s.slice(-4),
          { x: window.scrollX + 80 + Math.random() * (window.innerWidth - 260), y: window.scrollY + 80 + Math.random() * (window.innerHeight - 260), r: Math.random() * 360, key: Date.now() },
        ]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  useEffect(() => {
    const onEgg = (e: Event) => {
      const { id, isNew } = (e as CustomEvent<EggEvent>).detail;
      if (!isNew) return;
      play("pop");
      setToast({ id, key: Date.now() });
    };
    window.addEventListener("diary:egg", onEgg);
    return () => window.removeEventListener("diary:egg", onEgg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 z-30 h-0 w-full" aria-hidden>
        {stains.map((s) => (
          <svg
            key={s.key}
            viewBox="0 0 200 200"
            className="absolute h-44 w-44 mix-blend-multiply"
            style={{ left: s.x, top: s.y, transform: `rotate(${s.r}deg)`, animation: "stain-in .5s ease-out" }}
          >
            <circle cx="100" cy="100" r="74" fill="none" stroke="#8a5a2b" strokeOpacity=".45" strokeWidth="9" strokeDasharray="300 18 60 12" />
            <circle cx="100" cy="100" r="68" fill="#a36a35" fillOpacity=".09" />
            <circle cx="172" cy="56" r="7" fill="#8a5a2b" fillOpacity=".35" />
            <circle cx="186" cy="74" r="3.5" fill="#8a5a2b" fillOpacity=".3" />
          </svg>
        ))}
      </div>

      <div aria-live="polite" className="pointer-events-none fixed bottom-20 left-1/2 z-[70] -translate-x-1/2 md:bottom-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.key}
              initial={{ y: 40, rotate: -6, opacity: 0 }}
              animate={{ y: 0, rotate: -2, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="flex items-center gap-3 border-[3px] border-ink bg-sun px-4 py-2 shadow-brutal-lg"
            >
              <span className="font-display text-2xl">★</span>
              <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.25em]">easter egg found</span>
                <span className="font-display text-lg font-extrabold uppercase">{EGGS[toast.id].name}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
