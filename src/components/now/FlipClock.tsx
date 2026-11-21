"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";

function FlipDigit({ value }: { value: string }) {
  const [shown, setShown] = useState(value);
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  if (value !== shown) {
    setPrev(shown);
    setShown(value);
    setFlipping(true);
  }

  useEffect(() => {
    if (!flipping) return;
    const t = setTimeout(() => setFlipping(false), 650);
    return () => clearTimeout(t);
  }, [flipping]);

  const half = "absolute inset-x-0 h-1/2 overflow-hidden bg-ink text-cream";
  const glyph = "absolute inset-x-0 flex h-[200%] items-center justify-center font-display font-extrabold leading-none";
  return (
    <span className="flip-card relative inline-block h-[1.35em] w-[0.9em] text-[clamp(3rem,10vw,6.5rem)]" aria-hidden>
      {/* static top (new) + bottom (old until the flap lands) */}
      <span className={`${half} top-0 rounded-t-md border-b border-black/60`}>
        <span className={`${glyph} top-0`}>{shown}</span>
      </span>
      <span className={`${half} bottom-0 rounded-b-md`}>
        <span className={`${glyph} bottom-0`}>{flipping ? prev : shown}</span>
      </span>
      {flipping && (
        <>
          <span className={`${half} flip-flap animate-flip-down top-0 z-10 rounded-t-md`}>
            <span className={`${glyph} top-0`}>{prev}</span>
          </span>
          <span className={`${half} animate-flip-up bottom-0 z-10 rounded-b-md [backface-visibility:hidden]`}>
            <span className={`${glyph} bottom-0`}>{shown}</span>
          </span>
        </>
      )}
      {/* hinge */}
      <span className="absolute left-0 right-0 top-1/2 z-20 h-[3px] -translate-y-1/2 bg-black/70" />
      <span className="absolute -left-1 top-1/2 z-20 h-3 w-1.5 -translate-y-1/2 rounded-sm bg-[#777]" />
      <span className="absolute -right-1 top-1/2 z-20 h-3 w-1.5 -translate-y-1/2 rounded-sm bg-[#777]" />
    </span>
  );
}

function partsFor(date: Date, tz: string, h24: boolean) {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: !h24 });
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "short" }).format(date);
  return { h: (p.hour ?? "00").padStart(2, "0"), m: p.minute ?? "00", s: p.second ?? "00", ampm: (p.dayPeriod ?? "").toUpperCase(), day };
}

/**
 * Mechanical flip clock showing the owner's local time.
 * Click to toggle 12/24h. Click it a lot and time gets… weird.
 */
export function FlipClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [h24, setH24] = useState(true);
  const [warp, setWarp] = useState(0);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clock starts on the client only
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const shownDate = now ? new Date(now.getTime() + warp) : null;
  const p = shownDate ? partsFor(shownDate, site.timezone, h24) : { h: "--", m: "--", s: "--", ampm: "", day: "…" };

  const onClick = () => {
    play("tick");
    setH24((v) => !v);
    const t = Date.now();
    clicks.current = [...clicks.current.filter((c) => t - c < 2500), t];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      findEgg("clock");
      setWarp((w) => (w ? 0 : 1000 * 60 * 60 * 24 * 365 * 10));
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Local time for ${site.firstName}: ${p.h}:${p.m}. Click to switch 12/24-hour format.`}
        className="group relative block w-full border-[3px] border-ink bg-[#2a2a2a] p-4 shadow-brutal-lg sm:p-6"
        style={{ backgroundImage: "linear-gradient(180deg, #3a3a3a, #1d1d1d)" }}
      >
        <span className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-cream/70">
          <span>{site.location.replace(/\[|\]/g, "")} · {site.timezone}</span>
          <span>{h24 ? "24H" : p.ampm || "12H"}</span>
        </span>
        <span className="flex items-center justify-center gap-1 sm:gap-2">
          <FlipDigit value={p.h[0]} />
          <FlipDigit value={p.h[1]} />
          <span className="px-0.5 font-display text-5xl font-extrabold text-coral animate-blink sm:text-6xl">:</span>
          <FlipDigit value={p.m[0]} />
          <FlipDigit value={p.m[1]} />
          <span className="hidden px-0.5 font-display text-5xl font-extrabold text-coral sm:inline sm:text-6xl">:</span>
          <span className="hidden sm:contents">
            <FlipDigit value={p.s[0]} />
            <FlipDigit value={p.s[1]} />
          </span>
        </span>
        <span className="mt-3 block text-center font-hand text-2xl font-bold text-sun">
          {warp ? "…wait, is that the future?" : p.day}
        </span>
      </button>
      <span className="absolute -bottom-3 left-6 h-3 w-8 border-[3px] border-t-0 border-ink bg-[#2a2a2a]" aria-hidden />
      <span className="absolute -bottom-3 right-6 h-3 w-8 border-[3px] border-t-0 border-ink bg-[#2a2a2a]" aria-hidden />
    </div>
  );
}
