"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { deskObjects, type DeskObjectId } from "@/data/desk";
import { useWebGL } from "@/hooks/useWebGL";
import { play } from "@/lib/sound";
import { cn, tilt } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Hand, SampleStamp } from "@/components/ui/Typography";

const DeskScene = dynamic(() => import("@/components/3d/DeskScene"), { ssr: false });

/** Flat, illustrated desk for devices without WebGL. */
function FlatDesk({ selected, onSelect }: { selected: DeskObjectId | null; onSelect: (id: DeskObjectId) => void }) {
  return (
    <div className="absolute inset-0 grid grid-cols-4 place-items-center gap-3 p-6" style={{ background: "repeating-linear-gradient(90deg,#b9814f 0 40px,#b07a49 40px 80px)" }}>
      {deskObjects.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          aria-pressed={selected === o.id}
          className={cn("brutal grid aspect-square w-full max-w-28 place-items-center p-2 font-display text-xs font-extrabold uppercase transition-transform hover:-translate-y-1", selected === o.id && "-translate-y-2")}
          style={{ background: o.color, transform: `rotate(${tilt(o.id, 6)}deg)` }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AboutDesk() {
  const tier = useWebGL();
  const reduced = !!useReducedMotion();
  const [selected, setSelected] = useState<DeskObjectId | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const use3D = tier !== null && tier !== "none" && !failed;
  const obj = deskObjects.find((o) => o.id === selected);

  const select = (id: DeskObjectId) => {
    setSelected((s) => (s === id ? null : id));
    play("thunk");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
      <div className="relative aspect-[4/3] w-full overflow-hidden border-[3px] border-ink bg-[#d9c4a0] shadow-brutal-lg sm:aspect-[16/10]">
        {use3D ? (
          <ErrorBoundary fallback={<FlatDesk selected={selected} onSelect={select} />} onError={() => setFailed(true)}>
            <DeskScene quality={tier === "high" ? "high" : "low"} reduced={reduced} selected={selected} onSelect={select} onReady={() => setReady(true)} />
          </ErrorBoundary>
        ) : tier === "none" || failed ? (
          <FlatDesk selected={selected} onSelect={select} />
        ) : null}
        {use3D && !ready && (
          <p className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.3em] text-ink-soft">tidying the desk…</p>
        )}
        <Hand className="pointer-events-none absolute left-3 top-2 -rotate-2 text-xl text-ink sm:text-2xl">
          {use3D ? "drag to tilt · click my stuff" : "click my stuff"}
        </Hand>

        <AnimatePresence>
          {obj && (
            <motion.div
              key={obj.id}
              initial={{ y: 30, opacity: 0, rotate: -6 }}
              animate={{ y: 0, opacity: 1, rotate: -2 }}
              exit={{ y: 30, opacity: 0 }}
              className="absolute bottom-3 left-3 right-3 border-[3px] border-ink bg-paper p-4 shadow-brutal sm:left-auto sm:w-80"
              role="status"
            >
              <button onClick={() => setSelected(null)} aria-label="Close note" className="absolute right-2 top-2 p-1">
                <X className="h-4 w-4" />
              </button>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]">{obj.label}</p>
              <p className="mt-1 font-hand text-2xl font-semibold leading-tight">{obj.text.replace("[PLACEHOLDER] ", "")}</p>
              {obj.text.includes("[PLACEHOLDER]") && <SampleStamp className="mt-2" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* accessible legend: every desk object as a button */}
      <div className="relative border-[3px] border-ink bg-paper p-4 shadow-brutal">
        <p className="font-display text-lg font-extrabold uppercase">On the desk</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {deskObjects.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => select(o.id)}
                aria-pressed={selected === o.id}
                className={cn(
                  "flex w-full items-center gap-2 border-2 border-ink px-2 py-1.5 text-left font-mono text-xs uppercase transition-colors",
                  selected === o.id ? "bg-ink text-paper" : "bg-cream hover:bg-sun",
                )}
              >
                <span className="h-3 w-3 shrink-0 border-2 border-ink" style={{ background: o.color }} />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
