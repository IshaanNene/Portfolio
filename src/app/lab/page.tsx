import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { labIdeas } from "@/data/lab";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SampleStamp } from "@/components/ui/Typography";
import { Tape } from "@/components/ui/Decor";
import { Terminal } from "@/components/lab/Terminal";
import { LatencyScale, MorseEncoder, SortingVisualiser } from "@/components/lab/Experiments";
import { Classified } from "@/components/lab/Classified";
import { tilt } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lab",
  description: `${site.name}'s lab — a working terminal, small experiments and ideas in progress.`,
};

function Specimen({ no, title, note, children, color }: { no: string; title: string; note: string; children: ReactNode; color: string }) {
  return (
    <article className="relative border-[3px] border-ink bg-paper p-5 shadow-brutal-lg" style={{ transform: `rotate(${tilt(no, 1)}deg)` }}>
      <Tape className="-top-3 right-8 rotate-6" />
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]">specimen #{no}</p>
          <h3 className="font-display text-xl font-extrabold uppercase">{title}</h3>
          <p className="font-hand text-lg leading-tight text-ink-soft">{note}</p>
        </div>
        <span className="h-8 w-8 shrink-0 rounded-full border-[3px] border-ink" style={{ background: color }} aria-hidden />
      </header>
      {children}
    </article>
  );
}

export default function LabPage() {
  return (
    <PageShell>
      <PageHeader page="06" kicker="experiments · prototypes · weird stuff" color="bg-electric text-paper" title={<>The<br />lab.</>} note="safety goggles recommended" />

      <section aria-labelledby="terminal">
        <SectionHeading id="terminal" note="it actually works. type 'help'.">Terminal</SectionHeading>
        <Terminal />
      </section>

      <section aria-labelledby="specimens" className="mt-24">
        <SectionHeading id="specimens" note="small interactive widgets">Experiments</SectionHeading>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          <Specimen no="001" title="Sort it out" note="watch algorithms argue with an array" color="#FFD84D">
            <SortingVisualiser />
          </Specimen>
          <Specimen no="002" title="Dot dash" note="text → morse / binary (with beeps)" color="#9DDC8B">
            <MorseEncoder />
          </Specimen>
          <Specimen no="003" title="Human-scale latency" note="an engineering concept I love" color="#477BFF">
            <LatencyScale />
          </Specimen>
        </div>
      </section>

      <section aria-labelledby="ideas" className="mt-24 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHeading id="ideas" note="unfinished on purpose">Ideas I&rsquo;m exploring</SectionHeading>
          <ul className="grid gap-5 sm:grid-cols-2">
            {labIdeas.map((idea, i) => (
              <li key={idea.id} className="grid-paper relative border-[3px] border-ink bg-paper p-4 shadow-brutal" style={{ transform: `rotate(${tilt(i + 4, 2)}deg)` }}>
                <span className="border-2 border-ink bg-sun px-1.5 font-mono text-[10px] uppercase">{idea.status}</span>
                <p className="mt-2 font-display text-lg font-extrabold uppercase leading-tight">{idea.title}</p>
                <p className="mt-1 font-hand text-xl leading-tight">{idea.body}</p>
                {idea.title.includes("[SAMPLE]") && <SampleStamp className="mt-2" />}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeading note="eyes only">Classified</SectionHeading>
          <Classified />
        </div>
      </section>
    </PageShell>
  );
}
