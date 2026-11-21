"use client";

import Link from "next/link";
import { useRef } from "react";
import { colorClass, navItems } from "@/config/nav";
import { site } from "@/config/site";
import { tilt } from "@/lib/utils";
import { Hand } from "@/components/ui/Typography";
import { StarSticker, Washi } from "@/components/ui/Scrapbook";
import { PaperClip } from "@/components/ui/Decor";
import {
  Circled,
  Corrected,
  Doodle,
  HandArrow,
  PaperStack,
  PushPin,
  ScrapbookLabel,
  Staple,
  StickyPaper,
  TornPaper,
  Underlined,
} from "@/components/scrapbook/pieces";
import { DragSticky, Draggable, HoverNote, Liftable, LooseClip, PhotoCard, SecretStamp, Sticker } from "@/components/scrapbook/interactive";

const clean = (s: string) => s.replace(/\[PLACEHOLDER\]\s*/g, "").replace(/^\[|\]$/g, "");

/** The scrapbook spread under the 3D diary: intro, contents and a desk of loose bits. */
export function HomeSpread() {
  const desk = useRef<HTMLDivElement>(null);
  const today = "p.01";

  return (
    <section id="index" aria-labelledby="index-title" className="scroll-mt-10">
      <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr]">
        {/* intro on a torn, ruled sheet */}
        <TornPaper seed={4} ruled rotate={-1.2} className="pb-2" edges={["top", "right", "bottom"]}>
          <div className="relative px-6 pb-10 pl-16 pt-10 sm:pr-10">
            <Washi pattern="stripe" color="#FF755E" className="-top-1 left-10 -rotate-6" />
            <Washi pattern="dots" color="#477BFF" className="-top-1 right-8 rotate-[8deg]" />
            <div className="flex flex-wrap items-center gap-2">
              <ScrapbookLabel kind="date" rotate={-2}>
                {today} — cover notes
              </ScrapbookLabel>
              <ScrapbookLabel kind="category" rotate={4}>
                about me
              </ScrapbookLabel>
            </div>
            <h2 id="index-title" className="mt-5 text-[clamp(2.6rem,7vw,5.2rem)] font-extrabold uppercase leading-[0.9]">
              Hi, I&rsquo;m <Circled>{site.firstName}</Circled>.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed">
              <Underlined>{clean(site.role)}</Underlined> · {clean(site.location)}. {clean(site.tagline)}
            </p>
            <p className="mt-8 font-hand text-2xl font-bold leading-snug">
              I <Corrected wrong="make" right="build" /> things on the web, then <HoverNote note="mostly on purpose.">break them</HoverNote> to see how they work.
            </p>
            <div className="mt-6 flex items-end gap-2">
              <Hand as="p" className="max-w-sm text-2xl text-electric">
                every coloured tab sticking out of the diary is a different chapter — go on, flip through.
              </Hand>
              <HandArrow className="mb-6 hidden shrink-0 -rotate-12 sm:block" color="#477BFF" />
            </div>
            <Doodle kind="star" className="absolute bottom-4 right-6 h-12 w-12" color="#FF755E" />
          </div>
        </TornPaper>

        {/* contents as an index card on a little stack of paper */}
        <PaperStack className="mx-2 rotate-[1.4deg] sm:mx-6" seed={7}>
          <div className="relative border-[3px] border-ink bg-paper p-5 pt-4 shadow-brutal-lg">
            <Staple className="absolute -top-1 left-8" rotate={-8} />
            <Staple className="absolute -top-1 right-8" rotate={6} />
            <div className="flex items-baseline justify-between border-b-[3px] border-coral pb-1">
              <p className="font-display text-xl font-extrabold uppercase">Table of contents</p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">index card · 01</span>
            </div>
            <ol className="mt-2">
              {navItems.map((n, i) => (
                <li key={n.href} className="border-b border-electric/30">
                  <Link href={n.href} className="group flex items-baseline gap-3 py-2">
                    <span className="font-mono text-xs">{n.page}</span>
                    <span className="font-display text-lg font-extrabold uppercase transition-transform group-hover:translate-x-1">
                      {n.label}
                    </span>
                    <span className="ml-auto truncate font-hand text-lg text-ink-soft">{n.blurb}</span>
                    {i === 2 && <span className="font-hand text-lg text-coral">★ fav</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </PaperStack>
      </div>

      {/* chapters as a pile of different paper things */}
      <ul className="mt-20 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
        {navItems.map((n, i) => (
          <li key={n.href}>
            <Liftable rotate={tilt(i + 3, 3)}>
              <ChapterTile i={i} href={n.href} page={n.page} label={n.label} blurb={n.blurb} color={colorClass[n.color]} />
            </Liftable>
          </li>
        ))}
      </ul>

      {/* desk of loose bits — pick things up */}
      <div className="mt-24">
        <div className="flex flex-wrap items-end gap-3">
          <h3 className="text-3xl font-extrabold uppercase sm:text-4xl">
            <span className="scribble-underline">Loose bits</span>
          </h3>
          <Hand className="text-xl text-ink-soft">things that fell out of the diary. pick them up, move them about.</Hand>
        </div>
        <div
          ref={desk}
          className="cork relative mt-6 flex flex-wrap items-start justify-center gap-8 border-[3px] border-ink p-6 shadow-brutal-lg md:block md:h-[34rem] md:p-0"
        >
          {/* a hidden photo lies underneath the top one */}
          <Draggable bounds={desk} rotate={-9} className="hidden md:absolute md:left-[6%] md:top-14 md:block">
            <PhotoCard alt="a hidden photo" caption="you found me!" tint="#FFD84D" back="most people never move the top photo. you did. ★" />
          </Draggable>
          <Draggable bounds={desk} rotate={5} className="md:absolute md:left-[5%] md:top-10">
            <div className="relative">
              <PhotoCard src={site.photo} alt={site.photoAlt} caption="me, probably" back="this is the photo I'd put on a fridge." size="md" />
              <Washi pattern="grid" color="#9DDC8B" className="-top-3 left-1/2 -translate-x-1/2 rotate-3 !w-20" />
            </div>
          </Draggable>
          <Draggable bounds={desk} rotate={-4} className="md:absolute md:left-[30%] md:top-24">
            <div className="relative">
              <PhotoCard alt="desk at night" caption="late-night desk" tint="#477BFF" back="the best ideas show up after 11pm." size="sm" />
              <PushPin className="absolute -top-3 left-1/2 -translate-x-1/2" color="#FFD84D" />
            </div>
          </Draggable>

          <DragSticky bounds={desk} color="pink" rotate={4} className="md:absolute md:right-[22%] md:top-10">
            drag me anywhere. I&rsquo;ll stay put.
          </DragSticky>
          <DragSticky bounds={desk} color="blue" rotate={-6} className="md:absolute md:right-[6%] md:top-28">
            psst — turn the photos over.
          </DragSticky>
          <DragSticky bounds={desk} color="green" rotate={3} className="md:absolute md:bottom-10 md:left-[40%]">
            the stamp is hiding something…
          </DragSticky>

          <div className="relative md:absolute md:bottom-16 md:right-[12%]">
            <SecretStamp label="Top secret" mark="opened" color="#477BFF" secret={<>the diary has a back page that was never bound in. ↑↑↓↓←→←→ B A</>} />
          </div>

          <Draggable bounds={desk} rotate={8} className="md:absolute md:bottom-8 md:left-[8%]">
            <StickyPaper color="yellow" className="w-44">
              <p className="font-hand text-xl font-bold leading-tight">
                to-do:
                <br />
                <s className="decoration-coral decoration-2">build a portfolio</s>
                <br />
                make it feel like paper ✓
              </p>
            </StickyPaper>
          </Draggable>

          <div className="flex gap-3 md:absolute md:right-[40%] md:top-12">
            <Sticker label="star sticker" egg="sticker2">
              <StarSticker className="h-14 w-14" />
            </Sticker>
            <Sticker label="lightning bolt sticker">
              <svg viewBox="0 0 100 100" className="h-14 w-14" aria-hidden>
                <path d="M58 6 L22 56 H46 L38 94 L78 40 H54 Z" fill="#FFD84D" stroke="#fff" strokeWidth="12" strokeLinejoin="round" paintOrder="stroke" />
                <path d="M58 6 L22 56 H46 L38 94 L78 40 H54 Z" fill="none" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
              </svg>
            </Sticker>
            <Sticker label="code sticker">
              <span className="grid h-14 w-20 place-items-center rounded-full border-[3px] border-ink bg-grass font-mono text-lg font-bold shadow-[0_0_0_5px_#fff]">{"</>"}</span>
            </Sticker>
          </div>

          <LooseClip bounds={desk} className="hidden md:block md:right-[33%] md:top-60" />
          <Doodle kind="rocket" className="hidden h-16 w-16 md:absolute md:bottom-6 md:right-[3%] md:block" />
          <Doodle kind="spiral" className="hidden md:absolute md:left-[44%] md:top-4 md:block" color="#FF755E" />
        </div>
        <p className="mt-3 text-right font-hand text-lg text-ink-soft">(it all goes back where it was when you leave. desks are like that.)</p>
      </div>
    </section>
  );
}

/** Each chapter tile is a different kind of paper object. */
function ChapterTile({ i, href, page, label, blurb, color }: { i: number; href: string; page: string; label: string; blurb: string; color: string }) {
  const kind = i % 4;
  const inner = (
    <>
      <span className="font-mono text-xs">p.{page}</span>
      <span className="font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">{label}</span>
      <span className="font-hand text-lg leading-tight opacity-80">{blurb}</span>
    </>
  );
  if (kind === 0)
    return (
      <Link href={href} className="relative block">
        <StickyPaper color={(["yellow", "pink", "blue", "green"] as const)[(i / 4) % 4 | 0]} className="aspect-square">
          <span className="flex h-full flex-col justify-between">{inner}</span>
        </StickyPaper>
      </Link>
    );
  if (kind === 1)
    return (
      <Link href={href} className="relative block">
        <TornPaper seed={i + 20} className="aspect-square" color="#FBF5E8" grid>
          <span className="flex h-full flex-col justify-between p-4">{inner}</span>
        </TornPaper>
        <Washi pattern="check" color="#FFD84D" className="-top-2 left-1/2 -translate-x-1/2 -rotate-3 !w-20" />
      </Link>
    );
  if (kind === 2)
    return (
      <Link href={href} className={`brutal relative flex aspect-square flex-col justify-between p-4 ${color}`}>
        {inner}
        <PaperClip className="absolute -top-5 right-5 rotate-[8deg]" />
      </Link>
    );
  return (
    <Link href={href} className="relative block aspect-square border-2 border-ink bg-paper p-3 shadow-[4px_5px_0_rgba(0,0,0,.2)]">
      <span className="flex h-full flex-col justify-between border-t-[3px] border-coral bg-[repeating-linear-gradient(180deg,transparent_0_23px,rgba(71,123,255,.28)_23px_24px)] pt-2">
        {inner}
      </span>
    </Link>
  );
}
