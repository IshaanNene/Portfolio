import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { Tape } from "@/components/ui/Decor";
import { AboutDesk } from "@/components/about/AboutDesk";
import { ScribblePage } from "@/components/about/ScribblePage";
import { tilt } from "@/lib/utils";
import { NameTag, Washi } from "@/components/ui/Scrapbook";
import { Doodle, HandArrow } from "@/components/scrapbook/pieces";
import { HoverNote, PhotoCard } from "@/components/scrapbook/interactive";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} — the desk, the background, the interests and the scribbles.`,
};

const clean = (s: string) => s.replace("[PLACEHOLDER] ", "");

export default function AboutPage() {
  const isSvg = site.photo.endsWith(".svg");
  return (
    <PageShell>
      <PageHeader page="05" kicker="my desk, my head" color="bg-grass" title={<>About<br />me.</>} note="it's usually messier than this" />

      <section aria-labelledby="desk">
        <h2 id="desk" className="sr-only">My desk</h2>
        <AboutDesk />
      </section>

      <section aria-labelledby="intro" className="mt-24 grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div>
        <div className="relative mx-auto w-full max-w-xs rotate-[-3deg] border-[3px] border-ink bg-paper p-3 pb-12 shadow-brutal-lg">
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
          <Image src={site.photo} alt={site.photoAlt} width={600} height={750} unoptimized={isSvg} className="aspect-[4/5] w-full border-2 border-ink object-cover" sizes="320px" />
          <Hand className="absolute bottom-3 left-4 text-2xl">{site.firstName}, probably debugging</Hand>
          <div className="absolute -right-24 top-10 hidden origin-top-left rotate-[10deg] scale-[0.55] md:block">
            <NameTag name={site.firstName} />
          </div>
        </div>
        {/* snapshots tucked under the portrait — click to read the backs */}
        <div className="relative mx-auto mt-10 flex max-w-xs justify-center gap-3">
          <div className="relative -rotate-6">
            <Washi pattern="dots" color="#FF755E" className="-top-3 left-6 -rotate-12 !w-16" />
            <PhotoCard alt="a painted snapshot of PES University" caption="PES, '22–'26" tint="#FFD84D" size="sm" back="B.Tech CSE, GPA 8.77. most of the side projects on this site started here." />
          </div>
          <div className="relative mt-6 rotate-[5deg]">
            <Washi pattern="grid" color="#477BFF" className="-top-3 right-6 rotate-12 !w-16" />
            <PhotoCard alt="a painted snapshot of a hackathon" caption="Kaggle, Nov '24" tint="#a9c3ff" size="sm" back="second place: forecasting dynamic pricing across years of multi-category sales." />
          </div>
          <Doodle kind="bulb" className="absolute -bottom-6 -left-8 h-12 w-12" color="#FF755E" />
          <HandArrow className="absolute -right-14 -top-8 hidden rotate-[200deg] md:block" color="#477BFF" />
        </div>
        </div>
        <div>
          <SectionHeading id="intro" note="the short version">Hello there</SectionHeading>
          <div className="space-y-4 text-lg leading-relaxed">
            {site.intro.map((p, i) => (
              <p key={i}>{clean(p)}</p>
            ))}
          </div>
          {site.intro.some((p) => p.includes("[PLACEHOLDER]")) && <SampleStamp className="mt-3" label="edit src/config/site.ts" />}
        </div>
      </section>

      <section className="mt-24 grid gap-8 md:grid-cols-3" aria-label="Interests and personality">
        <div className="border-[3px] border-ink bg-sun p-5 shadow-brutal" style={{ transform: `rotate(${tilt(1, 1.5)}deg)` }}>
          <h2 className="font-display text-2xl font-extrabold uppercase">
            <HoverNote note="the list grows every month.">Interests</HoverNote>
          </h2>
          <ul className="mt-3 space-y-1">
            {site.interests.map((x, i) => (
              <li key={i} className="font-hand text-2xl font-semibold leading-tight">
                ✦ {clean(x)}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-[3px] border-ink bg-paper p-5 shadow-brutal" style={{ transform: `rotate(${tilt(2, 1.5)}deg)` }}>
          <h2 className="font-display text-2xl font-extrabold uppercase">Personality</h2>
          <dl className="mt-3 space-y-2">
            {site.personality.map((x, i) => (
              <div key={i}>
                <dt className="font-mono text-xs font-bold uppercase tracking-[0.2em]">{x.label}</dt>
                <dd className="font-hand text-xl leading-tight">{clean(x.note)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative border-[3px] border-ink bg-electric p-5 text-paper shadow-brutal" style={{ transform: `rotate(${tilt(3, 1.5)}deg)` }}>
          <Doodle kind="bulb" className="absolute -right-4 -top-8 h-14 w-14" color="#FFD84D" />
          <h2 className="font-display text-2xl font-extrabold uppercase">What I love building</h2>
          <ul className="mt-3 space-y-1">
            {site.enjoyBuilding.map((x, i) => (
              <li key={i} className="font-hand text-2xl font-semibold leading-tight">
                → {clean(x)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="scribbles" className="mt-28">
        <SectionHeading id="scribbles" note="ideas, half-thoughts & sketches">The scribble page</SectionHeading>
        <ScribblePage />
      </section>
    </PageShell>
  );
}
