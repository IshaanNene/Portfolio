"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const LINES = [
  "$ press --the-button-you-were-told-not-to",
  "› deploying to production… on a friday",
  "› git push --force origin main ✓",
  "› DROP TABLE users; ✓",
  "› 2,147 tests failed. 0 tests existed.",
];

const PUNCHLINES = [
  "just kidding. nothing broke. (this time.)",
  "you pressed it again. bold. still nothing broke.",
  "ok, now you're just load-testing me.",
  "fine. you win. here's a gold star ★",
];

/**
 * What happens when you press the DO NOT PRESS sticker: a short screen glitch,
 * a fake catastrophe in a terminal, then the reveal. Repeat presses change the punchline.
 */
export function PressedPrank({ count, reduced }: { count: number; reduced: boolean }) {
  const [open, setOpen] = useState(0);
  const [seen, setSeen] = useState(count);
  if (count !== seen) {
    setSeen(count);
    setOpen(count);
  }

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    if (!reduced) html.classList.add("glitch");
    const unglitch = window.setTimeout(() => html.classList.remove("glitch"), 650);
    const close = window.setTimeout(() => setOpen(0), 9000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(0);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(unglitch);
      window.clearTimeout(close);
      html.classList.remove("glitch");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, reduced]);

  const punch = PUNCHLINES[Math.min(Math.max(open, 1) - 1, PUNCHLINES.length - 1)];
  const step = reduced ? 0 : 0.32;

  return (
    <AnimatePresence>
      {open > 0 && (
        <motion.div
          key={open}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: -1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 22, delay: reduced ? 0 : 0.45 }}
          className="pointer-events-auto absolute left-1/2 top-[22%] z-30 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2"
        >
          <div className="relative border-[3px] border-ink bg-ink text-cream shadow-[8px_8px_0_#FF755E]">
            <span aria-hidden className="tape -top-3 left-8 w-20 -rotate-6" />
            <div className="flex items-center gap-2 border-b-2 border-cream/20 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-coral" />
              <span className="h-3 w-3 rounded-full bg-sun" />
              <span className="h-3 w-3 rounded-full bg-grass" />
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-cream/60">incident.log</span>
              <button onClick={() => setOpen(0)} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center border-2 border-cream/40 hover:bg-cream/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 px-4 py-3 font-mono text-[13px] leading-relaxed">
              {LINES.map((l, i) => (
                <motion.p key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * step }} className={i >= 2 ? "text-coral" : ""}>
                  {l}
                </motion.p>
              ))}
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + LINES.length * step + 0.2 }} className="pt-2">
                <p className="font-hand text-2xl font-bold leading-tight text-sun">{punch}</p>
                <p className="mt-2 text-[12px] text-cream/70">
                  ★ easter egg found: <b className="text-cream">Button Pusher</b> ·{" "}
                  <Link href="/back-page" className="underline decoration-sun underline-offset-2 hover:text-sun">
                    see the back page
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
