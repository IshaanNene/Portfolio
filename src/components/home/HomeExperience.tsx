"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { faceLink, SPREAD_COUNT, spreadFaces } from "@/data/diary";
import { useWebGL } from "@/hooks/useWebGL";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ButtonLink } from "@/components/ui/Button";
import { Hand, ScribbleArrow } from "@/components/ui/Typography";
import { DiaryFallback } from "./DiaryFallback";
import { StatusPill } from "./StatusPill";

const HomeScene = dynamic(() => import("@/components/3d/HomeScene"), { ssr: false });

const MAX = SPREAD_COUNT - 1;
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setNarrow(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const next = useCallback(() => {
    play("paper");
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
          if (!s) return;
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
                findEgg("donotpress");
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
        <div className={cn("pointer-events-auto absolute right-4 top-16 transition-opacity sm:top-5 md:right-28", narrow && spread > 0 && "pointer-events-none opacity-0")}>
          <StatusPill />
        </div>

        {use3D && ready && spread === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute left-[8%] top-[24%] hidden -rotate-6 text-coral lg:block"
          >
            <Hand className="block text-3xl text-cream">click to open me!</Hand>
            <ScribbleArrow className="ml-24 mt-1 h-14 w-28 rotate-[30deg]" />
          </motion.div>
        )}
        {use3D && ready && spread === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-[14%] right-[6%] hidden max-w-[11rem] rotate-3 xl:block">
            <Hand className="text-2xl text-cream/80">psst — don&rsquo;t press the red seal</Hand>
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
            <div className="relative flex -rotate-1 items-center gap-3 border-[3px] border-ink bg-kraft px-3 py-2 shadow-brutal">
              <span aria-hidden className="tape -top-3 left-1/2 w-16 -translate-x-1/2 rotate-3" />
              <button
                onClick={prev}
                disabled={spread === 0}
                aria-label="Previous page"
                className="grid h-10 w-10 place-items-center border-[3px] border-ink bg-paper shadow-[0_4px_0_#171717] transition-[transform,box-shadow] duration-100 hover:-rotate-3 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:hover:rotate-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-end gap-1" aria-hidden>
                {Array.from({ length: SPREAD_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "grid w-5 place-items-center border-2 border-ink font-mono text-[8px] font-bold transition-all",
                      i === spread ? "h-6 bg-coral" : "h-4 bg-paper/90",
                    )}
                  >
                    {i === spread ? i + 1 : ""}
                  </span>
                ))}
              </div>
              <span className="sr-only" aria-live="polite">
                {spread === 0 ? "Diary closed" : `Spread ${spread} of ${MAX}`}
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
