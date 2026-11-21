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

      {/* 3D layer */}
      <div
        className="absolute inset-0"
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
              onReady={() => setReady(true)}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* CSS diary: SSR first paint + no-WebGL experience */}
      <AnimatePresence>
        {(!use3D || !ready) && (
          <motion.div
            key="fallback"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 grid place-items-center pt-10"
          >
            <DiaryFallback interactive={tier === "none" || failed} />
            {use3D && !ready && (
              <p className="absolute bottom-24 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-soft">binding the pages…</p>
            )}
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
            <Hand className="block text-3xl text-ink">click to open me!</Hand>
            <ScribbleArrow className="ml-24 mt-1 h-14 w-28 rotate-[30deg]" />
          </motion.div>
        )}
        {use3D && ready && spread === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-[14%] right-[6%] hidden max-w-[11rem] rotate-3 xl:block">
            <Hand className="text-2xl text-ink-soft">psst — don&rsquo;t press the red sticker</Hand>
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
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={spread === 0}
                aria-label="Previous page"
                className="brutal-sm grid h-11 w-11 place-items-center bg-paper transition-transform hover:-rotate-6 disabled:opacity-40"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-1.5" aria-hidden>
                {Array.from({ length: SPREAD_COUNT }).map((_, i) => (
                  <span key={i} className={cn("h-2.5 border-2 border-ink transition-all", i === spread ? "w-6 bg-coral" : "w-2.5 bg-paper")} />
                ))}
              </div>
              <span className="sr-only" aria-live="polite">
                {spread === 0 ? "Diary closed" : `Spread ${spread} of ${MAX}`}
              </span>
              <button
                onClick={next}
                disabled={atEnd}
                aria-label={spread === 0 ? "Open the diary" : "Next page"}
                className="brutal-sm grid h-11 w-11 place-items-center bg-sun transition-transform hover:rotate-6 disabled:opacity-40"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* scroll indicator */}
        <a
          href="#index"
          className="pointer-events-auto absolute bottom-6 left-6 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] md:flex"
        >
          <span className="grid h-10 w-6 place-items-start justify-center rounded-full border-[3px] border-ink pt-1.5">
            <span className="h-2 w-1 rounded-full bg-ink animate-bob" />
          </span>
          scroll for the index
        </a>
      </div>
    </section>
  );
}
