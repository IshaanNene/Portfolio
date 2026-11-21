"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { stampKinds, stamps, type Stamp } from "@/data/milestones";
import { play } from "@/lib/sound";
import { cn, tilt } from "@/lib/utils";

const PER_PAGE = 4;

function StampMark({ s, active, onClick, delay }: { s: Stamp; active: boolean; onClick: () => void; delay: number }) {
  const k = stampKinds[s.kind];
  const rot = tilt(s.id, 14);
  const shape =
    k.shape === "circle"
      ? "rounded-full aspect-square w-32"
      : k.shape === "oval"
        ? "rounded-[50%] w-40 h-28"
        : k.shape === "hex"
          ? "w-36 h-32 [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]"
          : "w-40 h-28";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${k.label}: ${s.title}, ${s.date}`}
      initial={{ scale: 2.2, opacity: 0, rotate: rot - 20 }}
      animate={{ scale: 1, opacity: 1, rotate: rot }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay }}
      onAnimationStart={() => play("stamp")}
      className={cn("relative grid place-items-center p-2 text-center", shape, active && "ring-4 ring-sun ring-offset-2")}
      style={{
        color: k.color,
        border: k.shape === "hex" ? "none" : `4px double ${k.color}`,
        background: k.shape === "hex" ? `${k.color}22` : "transparent",
        mixBlendMode: "multiply",
      }}
    >
      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.25em]">{k.label}</span>
      <span className="block font-display text-sm font-extrabold uppercase leading-none">{s.title.replace(/\[|\]/g, "")}</span>
      <span className="block font-mono text-[10px] font-bold">{s.date.replace(/\[|\]/g, "")}</span>
    </motion.button>
  );
}

/** Passport booklet — milestone stamps across flippable pages. */
export function Passport() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const pages = Math.ceil(stamps.length / PER_PAGE);
  const current = stamps.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const detail = stamps.find((s) => s.id === active);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          play("paper");
        }}
        className="group relative mx-auto block aspect-[5/7] w-[min(80vw,20rem)] -rotate-3 border-[3px] border-ink bg-[#1f3a6b] p-6 text-center text-[#e9c46a] shadow-brutal-xl transition-transform hover:rotate-0 hover:scale-[1.02]"
        aria-label="Open the developer passport"
      >
        <span className="block font-mono text-xs uppercase tracking-[0.4em]">Republic of Code</span>
        <span className="mx-auto mt-10 grid h-28 w-28 place-items-center rounded-full border-4 border-[#e9c46a]">
          <span className="font-display text-4xl font-extrabold">{"</>"}</span>
        </span>
        <span className="mt-10 block font-display text-4xl font-extrabold uppercase tracking-wider">Passport</span>
        <span className="mt-2 block font-mono text-xs uppercase tracking-[0.3em]">developer · {site.initials}</span>
        <span className="absolute bottom-4 left-0 right-0 font-hand text-xl text-cream/80 transition-transform group-hover:-translate-y-1">click to open</span>
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative grid border-[3px] border-ink bg-[#1f3a6b] p-2 shadow-brutal-xl sm:p-3 md:grid-cols-2">
        {/* left: ID page */}
        <div className="paper-grain relative hidden bg-[#f1eadb] p-6 md:block" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(31,58,107,.05) 0 2px, transparent 2px 10px)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1f3a6b]">Type P · Code CODE · No. {site.initials}0001</p>
          <div className="mt-4 flex gap-4">
            <div className="grid h-32 w-24 shrink-0 place-items-center border-2 border-ink bg-grass font-display text-3xl font-extrabold">{site.initials}</div>
            <dl className="space-y-1.5 font-mono text-[11px] uppercase">
              <div><dt className="text-[9px] text-ink-soft">Surname / Given names</dt><dd className="font-bold">{site.name}</dd></div>
              <div><dt className="text-[9px] text-ink-soft">Occupation</dt><dd className="font-bold">{site.role.replace(/\[|\]/g, "")}</dd></div>
              <div><dt className="text-[9px] text-ink-soft">Place of origin</dt><dd className="font-bold">{site.location.replace(/\[|\]/g, "")}</dd></div>
            </dl>
          </div>
          <p className="mt-6 break-all font-mono text-[11px] tracking-[0.15em] text-ink/70">
            P&lt;CODE{site.name.toUpperCase().replace(/\s/g, "<<")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            <br />
            {site.initials}0001&lt;&lt;2026&lt;SHIP&lt;IT&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </p>
          <div className="mt-6 min-h-24 border-t-2 border-dashed border-ink/40 pt-3">
            <AnimatePresence mode="wait">
              {detail ? (
                <motion.div key={detail.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: stampKinds[detail.kind].color }}>
                    {stampKinds[detail.kind].label} · {detail.place}
                  </p>
                  <p className="font-display text-xl font-extrabold uppercase">{detail.title}</p>
                  <p className="font-hand text-xl leading-tight">{detail.note}</p>
                </motion.div>
              ) : (
                <motion.p key="hint" className="font-hand text-xl text-ink-soft">tap a stamp to read the entry →</motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* right: visa page */}
        <div className="paper-grain relative min-h-[26rem] bg-[#f1eadb] p-5 md:border-l-2 md:border-dashed md:border-[#1f3a6b]/40">
          <p className="flex justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-[#1f3a6b]">
            <span>Visas · entries</span>
            <span>
              {page + 1}/{pages}
            </span>
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ rotateY: -70, opacity: 0, transformOrigin: "0% 50%" }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 70, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 grid grid-cols-2 place-items-center gap-4"
            >
              {current.map((s, i) => (
                <StampMark key={s.id} s={s} active={active === s.id} delay={0.15 + i * 0.18} onClick={() => setActive(active === s.id ? null : s.id)} />
              ))}
            </motion.div>
          </AnimatePresence>
          {/* mobile detail */}
          {detail && (
            <div className="mt-4 border-t-2 border-dashed border-ink/40 pt-2 md:hidden">
              <p className="font-display text-lg font-extrabold uppercase">{detail.title}</p>
              <p className="font-hand text-xl leading-tight">{detail.note}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            setPage((p) => Math.max(0, p - 1));
            play("paper");
          }}
          disabled={page === 0}
          className="brutal-sm grid h-11 w-11 place-items-center bg-paper disabled:opacity-40"
          aria-label="Previous passport page"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-hand text-2xl font-bold">flip the visa pages</span>
        <button
          onClick={() => {
            setPage((p) => Math.min(pages - 1, p + 1));
            play("paper");
          }}
          disabled={page === pages - 1}
          className="brutal-sm grid h-11 w-11 place-items-center bg-sun disabled:opacity-40"
          aria-label="Next passport page"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
