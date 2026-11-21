import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { projects, statusLabel } from "@/data/projects";
import { noteColor, weeklyUpdates } from "@/data/updates";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { Tape } from "@/components/ui/Decor";
import { FlipClock } from "@/components/now/FlipClock";
import { StickyBoard } from "@/components/now/StickyBoard";
import { ProjectArt } from "@/components/projects/ProjectArt";
import { tilt } from "@/lib/utils";
import { TearOffCalendar } from "@/components/now/TearOffCalendar";
import { CoffeeRing, StarSticker } from "@/components/ui/Scrapbook";
import { ScrapbookLabel, Staple } from "@/components/scrapbook/pieces";
import { HoverNote } from "@/components/scrapbook/interactive";

export const metadata: Metadata = {
  title: "Now",
  description: `What ${site.name} is building, learning and experimenting with right now.`,
};

export default function NowPage() {
  const active = projects.filter((p) => p.status === "in-progress" || p.status === "prototype").slice(0, 3);
  return (
    <PageShell>
      <PageHeader page="02" kicker="planner · this week" title={<>Right<br />now.</>} note="a page torn from my weekly planner" />

      <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <section aria-labelledby="clock-title">
          <h2 id="clock-title" className="sr-only">Local time and status</h2>
          <FlipClock />
          <div className="relative mt-10 rotate-[-1deg] border-[3px] border-ink bg-paper p-5 shadow-brutal">
            <Tape className="-top-3 left-8 rotate-[-8deg]" />
            <Staple className="absolute -top-1 right-10" rotate={4} />
            <div className="absolute -bottom-5 -right-4 hidden sm:block">
              <ScrapbookLabel kind="tag" n={1} color="bg-grass" rotate={5}>
                status
              </ScrapbookLabel>
            </div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className={`h-3 w-3 rounded-full border-2 border-ink ${site.status.available ? "bg-[#2fa046] animate-pulse-dot" : "bg-coral"}`} />
              currently working on
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
              {site.status.building.replace("[PLACEHOLDER] ", "")}
            </p>
            <Hand as="p" className="mt-2 text-electric">
              status: {site.status.label.replace("[PLACEHOLDER] ", "")}
            </Hand>
            {site.status.building.includes("[") && <SampleStamp className="absolute right-4 top-4" label="edit in config" />}
          </div>
          <div className="relative mt-14 flex flex-wrap items-start gap-10 pl-2">
            <TearOffCalendar />
            <div className="relative max-w-[15rem] pt-6">
              <CoffeeRing className="absolute -left-6 -top-4 h-36 w-36" />
              <p className="relative font-hand text-2xl font-bold leading-snug">
                a desk calendar of notes-to-self. tear a page off — there&rsquo;s always another one underneath.
              </p>
              <StarSticker className="relative mt-3 h-10 w-10 rotate-12" color="#9DDC8B" />
            </div>
          </div>
        </section>

        <section aria-labelledby="minis" className="relative">
          <SectionHeading id="minis" note="on the workbench">Mini projects</SectionHeading>
          <ul className="space-y-5">
            {active.map((p, i) => (
              <li key={p.slug} style={{ transform: `rotate(${tilt(p.slug, 1.6)}deg)` }}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group flex gap-4 border-[3px] border-ink bg-paper p-3 shadow-brutal transition-transform hover:-translate-y-1 hover:rotate-0"
                >
                  <ProjectArt project={p} className="h-20 w-24 shrink-0 border-2 border-ink object-cover" />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-extrabold uppercase leading-none">{p.name}</span>
                      <span className="border-2 border-ink bg-sun px-1.5 font-mono text-[10px] uppercase">{statusLabel[p.status]}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-snug">{p.summary}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                      #{String(i + 1).padStart(2, "0")} · {p.stack.slice(0, 3).join(" · ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="board" className="mt-20">
        <SectionHeading id="board" note="building · learning · experimenting">The pinboard</SectionHeading>
        <StickyBoard />
      </section>

      <section aria-labelledby="log" className="mt-20 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading id="log">
            Recent <HoverNote note="newest on top, oldest at the bottom.">updates</HoverNote>
          </SectionHeading>
          <Hand as="p" className="max-w-xs text-ink-soft">
            the weekly log. newest on top.
          </Hand>
        </div>
        <ol className="relative border-l-[3px] border-dashed border-ink pl-6">
          {weeklyUpdates.map((u, i) => (
            <li key={i} className="relative mb-6 last:mb-0">
              <span className="absolute -left-[2.15rem] top-1 h-5 w-5 rotate-45 border-[3px] border-ink" style={{ background: noteColor[u.tag] }} />
              <p className="mb-1 flex flex-wrap items-center gap-2">
                <ScrapbookLabel kind="date" rotate={i % 2 ? 1.5 : -1.5}>
                  {u.date.replace(/^\[|\]$/g, "")}
                </ScrapbookLabel>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{u.tag}</span>
              </p>
              <p className="font-hand text-2xl font-semibold leading-tight">{u.text.replace("[PLACEHOLDER] ", "")}</p>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
