"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { albums, guitar, nowPlaying, onRepeat, type Album } from "@/data/music";
import { play } from "@/lib/sound";
import { cn, tilt } from "@/lib/utils";
import { Washi } from "@/components/ui/Scrapbook";
import { PaperClip } from "@/components/ui/Decor";
import { HandArrow, ScrapbookLabel, Staple, StickyPaper, TornPaper } from "@/components/scrapbook/pieces";
import { HoverNote, PhotoCard, Sticker } from "@/components/scrapbook/interactive";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const clean = (s: string) => s.replace(/\[PLACEHOLDER\]\s*/g, "");

/* ───────── vinyl ───────── */

function Vinyl({ label, spinning, className }: { label: string; spinning: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative block aspect-square rounded-full border-[3px] border-ink", spinning && "animate-[spin_1.8s_linear_infinite] motion-reduce:animate-none", className)}
      style={{
        background:
          "radial-gradient(circle, transparent 33%, rgba(255,255,255,.07) 34%, transparent 35%, transparent 48%, rgba(255,255,255,.07) 49%, transparent 50%, transparent 63%, rgba(255,255,255,.06) 64%, transparent 65%), conic-gradient(from 30deg, #222 0 20%, #3a3a3a 25%, #1d1d1d 35% 70%, #333 76%, #1d1d1d 85%), #1d1d1d",
      }}
    >
      <span className="absolute inset-[34%] grid place-items-center rounded-full border-2 border-ink" style={{ background: label }}>
        <span className="h-2.5 w-2.5 rounded-full bg-ink" />
      </span>
      <span className="absolute left-[56%] top-[38%] h-1.5 w-3 rounded-full bg-white/70" />
    </span>
  );
}

/** The record player. Click to drop the needle. */
export function Turntable() {
  const [on, setOn] = useState(false);
  const reduced = !!useReducedMotion();
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative mx-auto w-full max-w-md">
        <div className="relative aspect-[5/4] border-[3px] border-ink bg-[#b9814f] p-5 shadow-brutal-xl" style={{ backgroundImage: "repeating-linear-gradient(92deg, rgba(90,50,20,.12) 0 3px, transparent 3px 11px)" }}>
          <div className="relative h-full w-[78%]">
            <span aria-hidden className="absolute inset-0 rounded-full bg-ink/80" />
            <Vinyl label="#B5835A" spinning={on} className="absolute inset-[2%]" />
          </div>
          {/* tonearm */}
          <motion.svg
            viewBox="0 0 60 200"
            className="absolute right-[8%] top-[6%] h-[80%] origin-[50%_8%] overflow-visible"
            animate={{ rotate: on ? 22 : 0 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 14 }}
            aria-hidden
          >
            <circle cx="30" cy="16" r="14" fill="#d4d8de" stroke="#171717" strokeWidth="3" />
            <path d="M30 16 L30 150 L18 175" fill="none" stroke="#d4d8de" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 16 L30 150 L18 175" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="8" y="170" width="20" height="16" rx="2" fill="#171717" transform="rotate(25 18 178)" />
          </motion.svg>
          {/* play button */}
          <button
            type="button"
            onClick={() => {
              setOn((o) => !o);
              play(on ? "tick" : "pop");
            }}
            aria-pressed={on}
            aria-label={on ? "Lift the needle" : "Drop the needle"}
            className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-coral font-display text-xs font-extrabold uppercase shadow-[0_4px_0_#171717] transition-[transform,box-shadow] duration-100 active:translate-y-1 active:shadow-none"
          >
            {on ? "■" : "▶"}
          </button>
          <span className="absolute bottom-5 left-5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">33⅓ rpm</span>
        </div>
        <p className="mt-4 text-center font-hand text-xl text-ink-soft">↑ press play. (it&rsquo;s silent. use your imagination.)</p>
      </div>

      {/* now playing card + currently listening */}
      <div className="relative flex flex-col items-start gap-10">
        <div className="relative w-full max-w-sm rotate-[1.5deg] border-[3px] border-ink bg-paper p-5 shadow-brutal-lg">
          <Washi pattern="stripe" color="#B5835A" className="-top-3 left-8 -rotate-6" />
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            <span className={cn("h-3 w-3 rounded-full border-2 border-ink", on ? "animate-pulse-dot bg-[#2fa046]" : "bg-coral")} />
            {on ? "now spinning" : "on the platter"}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{nowPlaying.track.replace(/^\[|\]$/g, "")}</p>
          <p className="mt-1 font-hand text-2xl font-bold text-electric">
            {nowPlaying.artist.replace(/^\[|\]$/g, "")} · {nowPlaying.album.replace(/^\[|\]$/g, "")}
          </p>
          <p className="mt-2 font-hand text-xl leading-tight text-ink-soft">{clean(nowPlaying.note)}</p>
        </div>
        <StickyPaper color="pink" rotate={-3} className="w-64">
          <Staple className="absolute -top-1 left-6" rotate={-6} />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">in the crate</p>
          <ol className="mt-2 space-y-1 font-hand text-xl font-bold leading-tight">
            {onRepeat.map((t, i) => (
              <li key={i}>
                {i + 1}. {t.replace(/\[|\]/g, "")}
              </li>
            ))}
          </ol>
        </StickyPaper>
      </div>
    </div>
  );
}

/* ───────── record crate ───────── */

function Sleeve({ album, i }: { album: Album; i: number }) {
  const [out, setOut] = useState(false);
  const cover = album.cover ? `${base}${album.cover}` : "";
  const title = album.title.replace(/^\[|\]$/g, "");
  const artist = album.artist.replace(/^\[|\]$/g, "");
  return (
    <li className="relative pt-10" style={{ transform: `rotate(${tilt(i + 2, 2.2)}deg)` }}>
      <button
        type="button"
        onMouseEnter={() => setOut(true)}
        onMouseLeave={() => setOut(false)}
        onFocus={() => setOut(true)}
        onBlur={() => setOut(false)}
        onClick={() => {
          setOut((o) => !o);
          play("paper");
        }}
        aria-expanded={out}
        aria-label={`${title} by ${artist}, ${album.year}. Pull the record out.`}
        className="relative block w-full text-left"
      >
        {/* the record slides up out of the sleeve */}
        <motion.span className="absolute inset-x-[6%] top-0 block" animate={{ y: out ? "-26%" : "0%" }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
          <Vinyl label={album.color} spinning={false} />
        </motion.span>
        <span className="relative block aspect-square overflow-hidden border-[3px] border-ink shadow-brutal" style={{ background: album.color }}>
          {cover ? (
            <Image src={cover} alt={`${title} cover`} fill sizes="240px" className="object-cover" unoptimized />
          ) : (
            <span className="absolute inset-0 flex flex-col justify-between p-3">
              <span aria-hidden className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(135deg, #171717 0 2px, transparent 2px 14px)" }} />
              <span className="relative font-mono text-[10px] font-bold uppercase tracking-widest">{album.year.replace(/^\[|\]$/g, "")}</span>
              <span className="relative">
                <span className="block bg-paper px-1.5 py-1 font-display text-lg font-extrabold uppercase leading-none shadow-[2px_2px_0_#171717] sm:text-xl">{title}</span>
                <span className="mt-1 inline-block bg-ink px-1.5 font-hand text-lg font-bold text-paper">{artist}</span>
              </span>
            </span>
          )}
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.18),transparent_40%)]" />
        </span>
      </button>
      <p className="mt-3 font-hand text-lg leading-tight text-ink-soft">{clean(album.note)}</p>
      <a
        href={`https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Listen to ${title} by ${artist} on Spotify (opens in a new tab)`}
        className="mt-2 inline-flex items-center gap-1 border-2 border-ink bg-grass px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_#171717] transition-transform hover:-translate-y-0.5"
      >
        ▶ listen on Spotify ↗
      </a>
    </li>
  );
}

export function RecordCrate() {
  return (
    <div className="relative">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {albums.map((a, i) => (
          <Sleeve key={i} album={a} i={i} />
        ))}
      </ul>
      <p className="mt-3 text-right font-hand text-lg text-ink-soft">hover (or tap) a sleeve to pull the record out</p>
    </div>
  );
}

/* ───────── guitar corner ───────── */

const TAB = ["e|-----0-----0-----|", "B|---1-----1-----1-|", "G|-2-----2-----2---|", "D|-----------------|", "A|-3---------------|", "E|-----------------|"];

export function GuitarCorner() {
  return (
    <div className="grid items-start gap-12 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr_0.8fr]">
      {/* photos */}
      <div className="relative flex min-h-[18rem] flex-wrap items-start justify-center gap-4 sm:block">
        <div className="relative sm:absolute sm:left-2 sm:top-4 sm:-rotate-6">
          <Washi pattern="dots" color="#B5835A" className="-top-3 left-1/2 -translate-x-1/2 rotate-3 !w-20" />
          <PhotoCard
            src={guitar.photos[0].src ? `${base}${guitar.photos[0].src}` : undefined}
            alt="Me playing guitar, motion-blurred under stage lights"
            caption={guitar.photos[0].caption}
            back={clean(guitar.photos[0].back)}
            tint="#FFD84D"
            size="md"
          />
        </div>
        <div className="relative sm:absolute sm:left-[48%] sm:top-24 sm:rotate-[5deg]">
          <PaperClip className="absolute -top-6 left-6 z-10 rotate-[-8deg]" />
          <PhotoCard
            src={guitar.photos[1].src ? `${base}${guitar.photos[1].src}` : undefined}
            alt="My silhouette on stage, horns up against a purple LED wall"
            caption={guitar.photos[1].caption}
            back={clean(guitar.photos[1].back)}
            tint="#a9c3ff"
            size="sm"
          />
        </div>
      </div>

      {/* tab scrap */}
      <TornPaper seed={52} rotate={-1.5} grid>
        <div className="relative p-6">
          <ScrapbookLabel kind="date" rotate={-2}>
            practice log
          </ScrapbookLabel>
          <pre className="mt-4 overflow-x-auto font-mono text-[13px] leading-6 text-ink/85" aria-label="A scribbled guitar tab">
            {TAB.join("\n")}
          </pre>
          {guitar.learning && (
            <p className="mt-3 font-hand text-2xl font-bold leading-tight">
              learning: <HoverNote note="slowly. very slowly.">{clean(guitar.learning)}</HoverNote>
            </p>
          )}
          <HandArrow className="absolute -bottom-6 right-4 rotate-[160deg]" color="#FF755E" />
        </div>
      </TornPaper>

      {/* pick + gear tag */}
      <div className="flex flex-col items-center gap-8 md:col-span-2 md:flex-row md:justify-center lg:col-span-1 lg:flex-col">
        <Sticker label="guitar pick sticker">
          <svg viewBox="0 0 100 110" className="h-24 w-24" aria-hidden>
            <path d="M50 104 C 20 78 6 52 8 30 C 10 10 30 4 50 4 C 70 4 90 10 92 30 C 94 52 80 78 50 104 Z" fill="#FF755E" stroke="#fff" strokeWidth="10" paintOrder="stroke" />
            <path d="M50 104 C 20 78 6 52 8 30 C 10 10 30 4 50 4 C 70 4 90 10 92 30 C 94 52 80 78 50 104 Z" fill="none" stroke="#171717" strokeWidth="3.5" />
            <text x="50" y="48" textAnchor="middle" fontSize="15" fontWeight="800" fill="#171717" style={{ fontFamily: "var(--font-display)" }}>
              .73mm
            </text>
          </svg>
        </Sticker>
        {guitar.gear && (
          <ScrapbookLabel kind="index" n="the guitar" rotate={3}>
            {clean(guitar.gear)}
          </ScrapbookLabel>
        )}
      </div>
    </div>
  );
}
