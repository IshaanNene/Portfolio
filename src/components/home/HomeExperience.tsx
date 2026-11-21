"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { faceLink, SPREAD_COUNT, spreadFaces } from "@/data/diary";
import { useWebGL } from "@/hooks/useWebGL";
import { deskDrag } from "@/lib/deskDrag";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ButtonLink } from "@/components/ui/Button";
import { Hand, ScribbleArrow } from "@/components/ui/Typography";
import { DiaryFallback } from "./DiaryFallback";
import { StatusPill } from "./StatusPill";
import { PressedPrank } from "./PressedPrank";

const HomeScene = dynamic(() => import("@/components/3d/HomeScene"), { ssr: false });

const MAX = SPREAD_COUNT - 1;

/** Handwritten asides that turn up only after a while of doing nothing — one at a time. */
const IDLE_NOTES = [
  { text: "still there? flip a page →", pos: "left-[7%] top-[56%]", rot: -4 },
  { text: "tip: the washi rolls, pencil & photos on the desk can be moved", pos: "left-[5%] top-[38%]", rot: 3 },
  { text: "← → arrow keys work too", pos: "left-[40%] top-[9%]", rot: -2 },
  { text: "tug a ribbon bookmark. go on.", pos: "left-[36%] bottom-[20%]", rot: 2 },
  { text: "there's a page that was never bound in…", pos: "left-[6%] bottom-[24%]", rot: -3 },
];
type Side = "left" | "right";

export function HomeExperience() {
  const router = useRouter();
  const tier = useWebGL();
  const reduced = !!useReducedMotion();
  const [narrow, setNarrow] = useState(false);
  const [spread, setSpread] = useState(0);
  const [side, setSide] = useState<Side>("left");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [idleNote, setIdleNote] = useState<number | null>(null);
  const [pressed, setPressed] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setNarrow(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const next = useCallback(() => {
    play(spread === 0 ? "open" : "paper");
    if (!narrow) return setSpread((k) => Math.min(MAX, k + 1));
    if (spread === 0) {
      setSpread(1);
      setSide("left");
    } else if (side === "left") setSide("right");
    else if (spread < MAX) {
      setSpread(spread + 1);
      setSide("left");
    }
  }, [narrow, spread, side]);

  const prev = useCallback(() => {
    play("paper");
    if (!narrow) return setSpread((k) => Math.max(0, k - 1));
    if (spread === 0) return;
    if (side === "right") setSide("left");
    else if (spread === 1) setSpread(0);
    else {
      setSpread(spread - 1);
      setSide("right");
    }
  }, [narrow, spread, side]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (window.scrollY > window.innerHeight * 0.6) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const use3D = tier !== null && tier !== "none" && !failed;

  // keep the open spread in the URL (#page-N) so back/forward step through the diary
  // hashRead: don't write the URL until the initial #page-N has been read, or a deep link gets wiped
  const hashRead = useRef(false);
  useEffect(() => {
    if (!hashRead.current) return;
    const ours = location.hash === "" || /^#page-\d+$/.test(location.hash);
    const want = spread === 0 ? "" : `#page-${spread}`;
    if (!ours || location.hash === want) return;
    history.pushState(history.state, "", want || location.pathname + location.search);
  }, [spread]);
  useEffect(() => {
    const read = () => {
      hashRead.current = true;
      const h = location.hash;
      if (h !== "" && !/^#page-\d+$/.test(h)) return; // e.g. #index — not a diary page
      const k = h ? Math.max(0, Math.min(MAX, Number(h.slice(6)) || 0)) : 0;
      setSpread((cur) => {
        if (cur !== k) play(k === 0 ? "thunk" : "paper");
        return k;
      });
      setSide("left");
    };
    const t = window.setTimeout(read, 0);
    window.addEventListener("popstate", read);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("popstate", read);
    };
  }, []);

  // occasional handwritten aside after ~14s of no input; any input tucks it away again
  useEffect(() => {
    if (!use3D || !ready) return;
    let shown = 0;
    let wait = 0;
    let hide = 0;
    const schedule = () => {
      window.clearTimeout(wait);
      wait = window.setTimeout(() => {
        setIdleNote(shown++ % IDLE_NOTES.length);
        hide = window.setTimeout(() => {
          setIdleNote(null);
          schedule();
        }, 7000);
      }, 14000);
    };
    const poke = () => {
      window.clearTimeout(hide);
      setIdleNote(null);
      schedule();
    };
    schedule();
    const evs = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((ev) => window.addEventListener(ev, poke, { passive: true }));
    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(hide);
      evs.forEach((ev) => window.removeEventListener(ev, poke));
    };
  }, [use3D, ready]);
  const [left, right] = spread === 0 ? [null, null] : spreadFaces(spread);
  const visibleFaces = spread === 0 ? [] : narrow ? [side === "left" ? left : right] : [left, right];
  const links = visibleFaces.map((f) => (f ? faceLink(f) : null)).filter(Boolean) as { href: string; label: string }[];
  const atEnd = narrow ? spread === MAX && side === "right" : spread === MAX;

  return (
    <section aria-label="Interactive diary" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <h1 className="sr-only">
        {site.name} — {site.role}. {site.tagline}
      </h1>

      {/* 3D layer — hidden until the diary's textures are painted, so no half-built book flashes up */}
      <div
        className={cn("absolute inset-0 transition-opacity duration-700", use3D && !ready && "opacity-0")}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || deskDrag.active) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) (dx < 0 ? next : prev)();
        }}
      >
        {use3D && (
          <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
            <HomeScene
              spread={spread}
              focus={narrow && spread > 0 ? side : "spread"}
              quality={tier === "high" ? "high" : "low"}
              reduced={reduced}
              wide={!narrow}
              onNext={next}
              onPrev={prev}
              onLink={(href) => {
                play("tick");
                router.push(href);
              }}
              onSticker={() => {
                play("thunk");
                setTimeout(() => play("glitch"), 250);
                findEgg("donotpress");
                setPressed((n) => n + 1);
              }}
              onJump={(k, s) => {
                play("paper");
                setSpread(k);
                setSide(s);
              }}
              onReady={() => setReady(true)}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* CSS diary only for devices without WebGL */}
      {(tier === "none" || failed) && (
        <div className="absolute inset-0 grid place-items-center pt-10">
          <DiaryFallback />
        </div>
      )}

      {/* while the 3D diary is being bound: a roll of tape, not a second diary */}
      <AnimatePresence>
        {tier !== "none" && !failed && !ready && (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 grid place-items-center"
            role="status"
          >
            <div className="flex flex-col items-center gap-4">
              <span aria-hidden className="relative grid h-20 w-20 animate-[spin_2.4s_linear_infinite] place-items-center rounded-full border-[10px] border-coral shadow-[4px_5px_0_#171717] motion-reduce:animate-none">
                <span className="h-9 w-9 rounded-full border-[5px] border-[#C8A374] bg-cream" />
              </span>
              <p className="font-hand text-2xl font-bold">binding the pages…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* overlay UI */}
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute right-4 top-16 sm:top-5 md:right-28">
          <StatusPill />
        </div>

        {use3D && ready && spread === 0 && (
          <motion.button
            type="button"
            onClick={next}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={reduced ? undefined : { rotate: -3, scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0 }}
            className="pointer-events-auto absolute left-[8%] top-[24%] hidden -rotate-6 text-left text-coral lg:block"
            aria-label="Open the diary"
          >
            <Hand className="block text-3xl text-cream underline decoration-sun/0 decoration-4 underline-offset-4 transition-colors hover:decoration-sun">click to open me!</Hand>
            <ScribbleArrow className="ml-24 mt-1 h-14 w-28 rotate-[30deg]" />
          </motion.button>
        )}
        <AnimatePresence>
          {use3D && ready && idleNote !== null && (
            <motion.div
              key={idleNote}
              aria-hidden
              initial={{ opacity: 0, y: reduced ? 0 : 8, rotate: IDLE_NOTES[idleNote].rot - 2 }}
              animate={{ opacity: 1, y: 0, rotate: IDLE_NOTES[idleNote].rot }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.5 }}
              className={cn("pointer-events-none absolute z-10 hidden max-w-[15rem] md:block", IDLE_NOTES[idleNote].pos)}
            >
              <div className="relative border-2 border-ink bg-paper px-3 pb-2 pt-3 shadow-brutal">
                <span className="absolute -top-2.5 left-1/2 h-4 w-14 -translate-x-1/2 rotate-2 bg-sun/80" />
                <Hand className="text-xl leading-tight text-ink">{IDLE_NOTES[idleNote].text}</Hand>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {use3D && ready && spread === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="group pointer-events-auto absolute bottom-[14%] right-[6%] hidden max-w-[12rem] rotate-3 xl:block">
            <Hand className="text-2xl text-cream/80">psst — don&rsquo;t press the red sticker</Hand>
            <Hand className="block max-h-0 overflow-hidden text-lg text-sun opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
              (seriously. it&rsquo;s load-bearing.)
            </Hand>
          </motion.div>
        )}

        {use3D && ready && (
          <div className="pointer-events-auto absolute inset-x-0 bottom-20 flex flex-col items-center gap-3 px-4 md:bottom-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {links.map((l) => (
                <ButtonLink key={l.href + l.label} href={l.href} variant="paper" className="text-xs">
                  Read: {l.label} <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              ))}
            </div>
            {/* page turner: a taped kraft strip with chunky keys */}
            <div className="relative flex max-w-full -rotate-1 items-center gap-2 border-[3px] border-ink bg-kraft px-2 py-2 shadow-brutal sm:gap-3 sm:px-3">
              <span aria-hidden className="tape -top-3 left-1/2 w-16 -translate-x-1/2 rotate-3" />
              <button
                onClick={prev}
                disabled={spread === 0}
                aria-label="Previous page"
                className="grid h-10 w-10 place-items-center border-[3px] border-ink bg-paper shadow-[0_4px_0_#171717] transition-[transform,box-shadow] duration-100 hover:-rotate-3 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:hover:rotate-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-7 items-end gap-1">
                {Array.from({ length: SPREAD_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i === spread) return;
                      play(i === 0 ? "thunk" : spread === 0 ? "open" : "paper");
                      setSpread(i);
                      setSide("left");
                    }}
                    aria-label={i === 0 ? "Close the diary" : `Go to page ${i}`}
                    aria-current={i === spread ? "page" : undefined}
                    className={cn(
                      "grid w-4 place-items-center border-2 border-ink font-mono sm:w-5 text-[8px] font-bold transition-all hover:-translate-y-0.5",
                      i === spread ? "h-7 bg-coral" : "h-4 bg-paper/90 hover:h-5 hover:bg-sun",
                    )}
                  >
                    {i === spread ? (i === 0 ? "★" : i) : ""}
                  </button>
                ))}
              </div>
              <span className="min-w-[3.75rem] text-center font-mono sm:min-w-[4.5rem] text-[11px] font-bold uppercase leading-tight" aria-live="polite">
                {spread === 0 ? "cover" : `page ${spread}`}
                <span className="block text-[9px] opacity-70">{spread === 0 ? "closed" : `of ${MAX}`}</span>
              </span>
              <button
                onClick={next}
                disabled={atEnd}
                aria-label={spread === 0 ? "Open the diary" : "Next page"}
                className="grid h-10 w-10 place-items-center border-[3px] border-ink bg-sun shadow-[0_4px_0_#171717] transition-[transform,box-shadow] duration-100 hover:rotate-3 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:hover:rotate-0"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <PressedPrank count={pressed} reduced={reduced} />

        {/* scroll indicator */}
        <a
          href="#index"
          className="group pointer-events-auto absolute bottom-6 left-6 hidden -rotate-3 items-center gap-2 border-2 border-ink bg-paper py-1.5 pl-5 pr-3 font-hand text-xl font-bold shadow-[3px_4px_0_rgba(0,0,0,.2)] transition-transform hover:-translate-y-0.5 hover:rotate-0 md:flex"
          style={{ clipPath: "polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%)" }}
        >
          <span aria-hidden className="absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-ink bg-cream" />
          scroll for the index <span className="inline-block animate-bob">↓</span>
        </a>
      </div>
    </section>
  );
}
