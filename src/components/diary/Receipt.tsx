"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scissors } from "lucide-react";
import { site } from "@/config/site";
import { careerMilestones, experience, type ExperienceEntry } from "@/data/experience";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { Barcode, RubberStamp } from "@/components/ui/Decor";

const typeCode: Record<ExperienceEntry["type"], string> = {
  "full-time": "FT",
  internship: "INT",
  freelance: "FRL",
  "open-source": "OSS",
  education: "EDU",
};

function Dots() {
  return <span className="mx-1 flex-1 translate-y-[-3px] border-b-2 border-dotted border-ink/50" aria-hidden />;
}

function Line({ left, right, bold }: { left: string; right?: string; bold?: boolean }) {
  return (
    <div className={`flex items-end text-[13px] leading-6 ${bold ? "font-bold" : ""}`}>
      <span className="min-w-0 break-words">{left}</span>
      {right !== undefined && (
        <>
          <Dots />
          <span className="shrink-0">{right}</span>
        </>
      )}
    </div>
  );
}

/**
 * Experience printed as one very long thermal receipt.
 * Entries "print" in as you scroll (GSAP ScrollTrigger clip reveal).
 */
export function Receipt() {
  const root = useRef<HTMLDivElement>(null);
  const [torn, setTorn] = useState(false);
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- timestamp is client-only
    setStamp(new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }));
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-print]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)", y: -14 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            ease: "steps(14)",
            duration: 0.9,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-stamp]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 2.4, opacity: 0, rotate: -30 },
          { scale: 1, opacity: 1, rotate: -8, ease: "back.out(2)", duration: 0.45, scrollTrigger: { trigger: el, start: "top 85%", once: true } },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const total = experience.length;

  return (
    <div ref={root} className="relative mx-auto max-w-xl">
      {/* printer */}
      <div className="relative z-10 mx-auto h-16 w-full border-[3px] sm:w-[calc(100%+2.5rem)] sm:-translate-x-5 border-ink bg-ink shadow-brutal-lg">
        <div className="absolute inset-x-6 bottom-3 h-2 rounded-full bg-black" />
        <span className="absolute left-4 top-3 h-3 w-3 rounded-full bg-grass animate-pulse-dot" />
        <span className="absolute right-4 top-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/60">thermal · 80mm</span>
      </div>

      <div className="relative -mt-3 px-2">
        <div className="perforated relative bg-paper px-5 py-8 font-mono text-ink shadow-[0_10px_0_rgba(0,0,0,.12)] sm:px-8" style={{ backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.025) 1px, transparent 1px)", backgroundSize: "3px 100%" }}>
          <header className="text-center" data-print>
            <p className="font-display text-2xl font-extrabold uppercase">{site.name}</p>
            <p className="text-[11px] uppercase tracking-[0.25em]">career store · est. {careerMilestones[0]?.date.replace(/\[|\]/g, "")}</p>
            <p className="text-[11px]">{site.location.replace(/\[|\]/g, "")}</p>
            <p className="mt-3 text-[11px]">
              RECEIPT #0001 · {stamp || "—"}
              <br />
              CASHIER: {site.firstName.toUpperCase()} · TILL 01
            </p>
            <p className="my-4 tracking-[0.3em]">{"=".repeat(28)}</p>
          </header>

          {experience.map((e, i) => (
            <section key={e.id} data-print className="mb-6" aria-label={`${e.role} at ${e.company}`}>
              <Line left={`${String(i + 1).padStart(2, "0")} ${e.role}`} right={typeCode[e.type]} bold />
              <Line left={`   @ ${e.company}${e.location ? " · " + e.location : ""}`} />
              <Line left={`   ${e.start} → ${e.end}`} />
              <div className="mt-2 space-y-0.5">
                {e.responsibilities.map((r, j) => (
                  <Line key={j} left={`   1x ${r}`} right="✓" />
                ))}
                {e.achievements.map((a, j) => (
                  <Line key={j} left={`   ★ BONUS: ${a}`} right="+1" bold />
                ))}
              </div>
              <div className="mt-2 border-l-4 border-ink/80 bg-cream/60 px-2 py-1 text-[12px] leading-5">
                <span className="font-bold">IMPACT:</span> {e.impact}
              </div>
              <Line left={`   STACK: ${e.stack.join(" / ")}`} />
              <p className="mt-3 text-center tracking-[0.3em] text-ink/60">{"- ".repeat(16)}</p>
            </section>
          ))}

          <section data-print aria-label="Career milestones">
            <p className="mb-1 text-center text-[11px] font-bold uppercase tracking-[0.3em]">** milestones **</p>
            {careerMilestones.map((m, i) => (
              <Line key={i} left={`>> ${m.label}`} right={m.date} />
            ))}
            <p className="my-4 tracking-[0.3em]">{"=".repeat(28)}</p>
          </section>

          <section data-print aria-label="Totals">
            <Line left="ROLES" right={String(total)} />
            <Line left="BUGS FIXED" right="∞" />
            <Line left="COFFEES" right="NaN" />
            <Line left="CURIOSITY" right="100%" />
            <div className="mt-2 flex items-end text-lg font-bold">
              TOTAL <Dots /> PRICELESS
            </div>
            <p className="mt-1 text-[11px]">PAID WITH: late nights & good teammates</p>
          </section>

          <div className="relative mt-6 text-center" data-print>
            <span data-stamp className="absolute -top-16 right-0 inline-block">
              <RubberStamp color="#FF755E">Paid in full</RubberStamp>
            </span>
            <Barcode value={site.name + "receipt"} />
            <p className="mt-1 text-[11px] tracking-[0.4em]">{site.initials}-0001-2026</p>
            <p className="mt-3 text-[12px]">THANK YOU FOR READING!</p>
            <p className="text-[11px]">no refunds · plenty of references on request</p>
          </div>

          {/* tear-off coupon */}
          <AnimatePresence>
            {!torn && (
              <motion.div
                key="coupon"
                exit={{ y: 260, rotate: 14, opacity: 0, transition: { duration: 0.9, ease: [0.5, 0, 0.75, 0] } }}
                className="mt-6"
              >
                <button
                  type="button"
                  onClick={() => {
                    setTorn(true);
                    play("rip");
                    findEgg("receipt");
                  }}
                  className="group flex w-full items-center gap-2 border-t-2 border-dashed border-ink pt-3 text-left text-[11px] uppercase tracking-[0.2em]"
                >
                  <Scissors className="h-4 w-4 transition-transform group-hover:-rotate-12" /> tear here
                </button>
                <div className="mt-2 border-2 border-ink p-3 text-center">
                  <p className="font-display text-lg font-extrabold uppercase">Coupon</p>
                  <p className="text-[12px]">good for one (1) coffee chat ☕</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {torn && (
            <p className="mt-6 text-center font-hand text-2xl font-bold">
              coupon redeemed → <Link className="underline decoration-coral" href="/contact">/contact</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
