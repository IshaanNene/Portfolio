"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { findEgg, useEggs } from "@/lib/eggs";
import { play, setSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { banner, completions, run, type OutLine, type Tone } from "./commands";

type Entry = { id: number; prompt?: string; lines: OutLine[] };

const toneClass = (amber: boolean): Record<Tone, string> => ({
  out: amber ? "text-[#ffcf7a]" : "text-[#b8f5b0]",
  muted: "text-cream/55",
  accent: amber ? "text-[#ffb347]" : "text-grass",
  error: "text-coral",
  ok: "text-sun",
  warn: "text-[#ffb3a6]",
});

/** Lines appear with a typewriter effect (instant under reduced motion). */
function TypedLines({ lines, amber, instant, onDone }: { lines: OutLine[]; amber: boolean; instant: boolean; onDone?: () => void }) {
  const total = lines.reduce((n, l) => n + l.text.length + 1, 0);
  const [typed, setN] = useState(instant ? total : 0);
  const n = instant ? total : typed;
  useEffect(() => {
    if (instant || n >= total) {
      onDone?.();
      return;
    }
    const id = setTimeout(() => setN((x) => Math.min(total, x + Math.max(3, Math.ceil(total / 40)))), 12);
    return () => clearTimeout(id);
  }, [n, total, instant, onDone]);
  const tc = toneClass(amber);
  const shownText: string[] = [];
  for (let i = 0, budget = n; i < lines.length; i++) {
    shownText.push(lines[i].text.slice(0, Math.max(0, budget)));
    budget -= lines[i].text.length + 1;
  }
  const visible = lines.filter((_, i) => i === 0 || shownText[i].length > 0 || n >= total);
  return (
    <>
      {visible.map((l, i) => {
        const shown = shownText[i];
        const cls = cn("whitespace-pre-wrap break-words", tc[l.tone ?? "out"]);
        if (l.href && shown.length === l.text.length) {
          const external = /^(https?:|mailto:)/.test(l.href);
          return external ? (
            <a key={i} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cn(cls, "block underline decoration-dotted underline-offset-4 hover:bg-white/10")}>
              {shown}
            </a>
          ) : (
            <Link key={i} href={l.href} className={cn(cls, "block underline decoration-dotted underline-offset-4 hover:bg-white/10")}>
              {shown}
            </Link>
          );
        }
        return (
          <div key={i} className={cls}>
            {shown || " "}
          </div>
        );
      })}
    </>
  );
}

function MatrixRain({ onEnd }: { onEnd: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const cols = Math.floor(c.width / 14);
    const drops = Array(cols).fill(0).map(() => Math.random() * -20);
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      ctx.fillStyle = "rgba(10,10,10,0.18)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#9DDC8B";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        ctx.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 14, y * 14);
        drops[i] = y * 14 > c.height && Math.random() > 0.96 ? 0 : y + 1;
      });
      if (performance.now() - start < 3500) raf = requestAnimationFrame(tick);
      else onEnd();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onEnd]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

export function Terminal() {
  const router = useRouter();
  const reduced = !!useReducedMotion();
  const eggs = useEggs();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: banner() }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [amber, setAmber] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [entries]);

  const submit = (cmd: string) => {
    const { lines, fx } = run(cmd, { history, eggsFound: eggs });
    if (cmd.trim()) setHistory((h) => [...h, cmd.trim()]);
    setHIndex(-1);
    if (fx?.clear) {
      setEntries([]);
      return;
    }
    setEntries((e) => [...e, { id: nextId.current++, prompt: cmd, lines }]);
    if (fx?.egg) findEgg(fx.egg);
    if (fx?.theme) setAmber((a) => !a);
    if (fx?.matrix) setMatrix(true);
    if (fx?.sound != null) setSoundEnabled(fx.sound);
    if (fx?.unlock) window.dispatchEvent(new Event("diary:unlock"));
    if (fx?.navigate) setTimeout(() => router.push(fx.navigate!), reduced ? 0 : 700);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = hIndex === -1 ? history.length - 1 : Math.max(0, hIndex - 1);
      setHIndex(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIndex === -1) return;
      const i = hIndex + 1;
      if (i >= history.length) {
        setHIndex(-1);
        setValue("");
      } else {
        setHIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = completions.filter((c) => c.startsWith(value.toLowerCase()));
      if (match.length === 1) setValue(match[0] + " ");
      else if (match.length > 1) setEntries((en) => [...en, { id: nextId.current++, prompt: value, lines: [{ text: match.join("  "), tone: "muted" }] }]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    } else if (e.key.length === 1) play("key");
  };

  const quick = ["help", "about", "projects", "skills", "experience", "contact"];

  return (
    <div className="relative">
      <div className="relative overflow-hidden border-[3px] border-ink bg-[#121212] shadow-brutal-xl" onClick={() => input.current?.focus()}>
        <div className="flex items-center gap-2 border-b-[3px] border-ink bg-sun px-3 py-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-ink bg-coral" />
          <span className="h-3.5 w-3.5 rounded-full border-2 border-ink bg-paper" />
          <span className="h-3.5 w-3.5 rounded-full border-2 border-ink bg-grass" />
          <span className="ml-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">visitor@diary: ~/lab</span>
        </div>
        <div
          ref={scroller}
          className="relative h-[26rem] overflow-y-auto p-4 font-mono text-[13px] leading-6 sm:h-[30rem] sm:text-sm"
          style={{ textShadow: amber ? "0 0 6px rgba(255,179,71,.35)" : "0 0 6px rgba(157,220,139,.35)" }}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {entries.map((e, idx) => (
            <div key={e.id} className="mb-2">
              {e.prompt !== undefined && (
                <div className="text-cream">
                  <span className={amber ? "text-[#ffb347]" : "text-grass"}>➜</span> <span className="text-electric">~</span> {e.prompt}
                </div>
              )}
              <TypedLines lines={e.lines} amber={amber} instant={reduced || idx < entries.length - 1} />
            </div>
          ))}
          <label className="flex items-center gap-2 text-cream">
            <span className={amber ? "text-[#ffb347]" : "text-grass"}>➜</span>
            <span className="text-electric">~</span>
            <span className="sr-only">Terminal command</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent caret-sun outline-none"
              aria-label="Type a command and press Enter"
            />
          </label>
          {/* scanlines */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.03)_0_1px,transparent_1px_3px)]" aria-hidden />
        </div>
        {matrix && <MatrixRain onEnd={() => setMatrix(false)} />}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick commands">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => {
              submit(q);
              input.current?.focus();
            }}
            className="border-2 border-ink bg-paper px-2 py-1 font-mono text-xs shadow-brutal-sm transition-transform hover:-translate-y-0.5"
          >
            $ {q}
          </button>
        ))}
      </div>
    </div>
  );
}
