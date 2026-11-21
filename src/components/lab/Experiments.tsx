"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { beep } from "@/lib/sound";
import { cn } from "@/lib/utils";

/* ───────── 1. Sorting visualiser ───────── */

type Step = { arr: number[]; a: number; b: number };

function* bubble(input: number[]): Generator<Step> {
  const arr = [...input];
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      yield { arr: [...arr], a: j, b: j + 1 };
    }
}
function* insertion(input: number[]): Generator<Step> {
  const arr = [...input];
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && arr[j - 1] > arr[j]) {
      [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
      yield { arr: [...arr], a: j - 1, b: j };
      j--;
    }
  }
}
function* quick(input: number[]): Generator<Step> {
  const arr = [...input];
  function* qs(lo: number, hi: number): Generator<Step> {
    if (lo >= hi) return;
    const p = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (arr[j] < p) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
      yield { arr: [...arr], a: j, b: hi };
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    yield { arr: [...arr], a: i, b: hi };
    yield* qs(lo, i - 1);
    yield* qs(i + 1, hi);
  }
  yield* qs(0, arr.length - 1);
}

const algos = { bubble, insertion, quick } as const;
const shuffled = (n: number) => Array.from({ length: n }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

export function SortingVisualiser() {
  const [algo, setAlgo] = useState<keyof typeof algos>("quick");
  const [arr, setArr] = useState<number[]>(() => Array.from({ length: 24 }, (_, i) => ((i * 7) % 24) + 1));
  const [hl, setHl] = useState<[number, number]>([-1, -1]);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const gen = useRef<Generator<Step> | null>(null);

  useEffect(() => {
    if (!running) return;
    if (!gen.current) gen.current = algos[algo](arr);
    const id = setInterval(() => {
      const r = gen.current!.next();
      if (r.done) {
        setRunning(false);
        setHl([-1, -1]);
        gen.current = null;
        return;
      }
      setArr(r.value.arr);
      setHl([r.value.a, r.value.b]);
      setSteps((s) => s + 1);
    }, 45);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, algo]);

  const reset = () => {
    gen.current = null;
    setRunning(false);
    setArr(shuffled(24));
    setHl([-1, -1]);
    setSteps(0);
  };

  return (
    <div>
      <div className="flex h-40 items-end gap-[3px] border-b-[3px] border-ink" aria-hidden>
        {arr.map((v, i) => (
          <div
            key={i}
            className={cn("flex-1 border-2 border-b-0 border-ink transition-[height] duration-75", i === hl[0] || i === hl[1] ? "bg-coral" : "bg-sun")}
            style={{ height: `${(v / arr.length) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(Object.keys(algos) as (keyof typeof algos)[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setAlgo(k);
              gen.current = null;
            }}
            aria-pressed={algo === k}
            className={cn("border-2 border-ink px-2 py-0.5 font-mono text-xs uppercase", algo === k ? "bg-ink text-paper" : "bg-paper")}
          >
            {k}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs">steps: {steps}</span>
        <button onClick={() => setRunning((r) => !r)} aria-label={running ? "Pause" : "Run"} className="brutal-sm bg-grass p-1.5">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={reset} aria-label="Shuffle" className="brutal-sm bg-paper p-1.5">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────── 2. Morse / binary encoder ───────── */

const MORSE: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--",
  n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};

export function MorseEncoder() {
  const [text, setText] = useState("hello world");
  const [mode, setMode] = useState<"morse" | "binary">("morse");
  const out =
    mode === "morse"
      ? text
          .toLowerCase()
          .split("")
          .map((c) => (c === " " ? "/" : MORSE[c] ?? ""))
          .join(" ")
      : text
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ");

  const playMorse = () => {
    const unit = 0.08;
    let t = 0;
    for (const sym of out) {
      if (sym === ".") {
        beep(unit, t);
        t += unit * 2;
      } else if (sym === "-") {
        beep(unit * 3, t);
        t += unit * 4;
      } else t += unit * 2;
    }
  };

  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.2em]" htmlFor="morse-in">
        plain text
      </label>
      <input
        id="morse-in"
        value={text}
        maxLength={40}
        onChange={(e) => setText(e.target.value)}
        className="mt-1 w-full border-[3px] border-ink bg-paper px-2 py-1.5 font-hand text-2xl outline-none focus:bg-sun/30"
      />
      <div className="mt-3 flex gap-2">
        {(["morse", "binary"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("border-2 border-ink px-2 py-0.5 font-mono text-xs uppercase", mode === m ? "bg-ink text-paper" : "bg-paper")}>
            {m}
          </button>
        ))}
        {mode === "morse" && (
          <button onClick={playMorse} className="ml-auto flex items-center gap-1 border-2 border-ink bg-sun px-2 py-0.5 font-mono text-xs uppercase">
            <Volume2 className="h-3.5 w-3.5" /> play
          </button>
        )}
      </div>
      <output className="mt-3 block min-h-16 break-all border-2 border-dashed border-ink bg-ink/5 p-2 font-mono text-sm leading-relaxed" aria-live="polite">
        {out || "…"}
      </output>
    </div>
  );
}

/* ───────── 3. Latency numbers at human scale ───────── */

const LATENCIES: [string, number][] = [
  ["L1 cache reference", 1],
  ["Branch mispredict", 3],
  ["Main memory reference", 100],
  ["Compress 1KB (fast codec)", 2_000],
  ["SSD random read", 16_000],
  ["Read 1MB from memory", 1_000],
  ["Round trip in datacenter", 500_000],
  ["Read 1MB from SSD", 49_000],
  ["Disk seek", 2_000_000],
  ["Packet CA → NL → CA", 150_000_000],
];

function human(seconds: number) {
  const units: [string, number][] = [
    ["years", 31_536_000],
    ["days", 86_400],
    ["hours", 3600],
    ["min", 60],
    ["s", 1],
  ];
  for (const [u, s] of units) if (seconds >= s) return `${(seconds / s).toFixed(seconds / s < 10 ? 1 : 0)} ${u}`;
  return `${seconds.toFixed(2)} s`;
}

export function LatencyScale() {
  // if 1 ns lasted `scale` seconds…
  const [exp, setExp] = useState(0);
  const scale = 10 ** exp;
  const max = Math.log10(150_000_000);
  return (
    <div>
      <label htmlFor="lat" className="font-hand text-xl font-bold">
        if 1 nanosecond lasted <span className="highlighter">{human(scale)}</span>…
      </label>
      <input id="lat" type="range" min={-2} max={2} step={1} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="mt-2 w-full accent-[#D2693A]" />
      <ul className="mt-3 space-y-1.5">
        {[...LATENCIES].sort((a, b) => a[1] - b[1]).map(([label, ns]) => (
          <li key={label} className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
            <span className="truncate font-mono">{label}</span>
            <span className="font-mono font-bold">{human(ns * scale)}</span>
            <motion.span
              className="col-span-2 block h-2 border-2 border-ink bg-electric"
              initial={false}
              animate={{ width: `${Math.max(3, (Math.log10(ns + 1) / max) * 100)}%` }}
            />
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[10px] text-ink-soft">approximate, after the classic “latency numbers” list.</p>
    </div>
  );
}
