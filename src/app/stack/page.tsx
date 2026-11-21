import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { FilingCabinet } from "@/components/stack/FilingCabinet";
import { LabelTape } from "@/components/ui/Scrapbook";
import { levelLabel } from "@/data/skills";
import { PaperStack, Staple } from "@/components/scrapbook/pieces";

const levelColor = { daily: "#9DDC8B", comfortable: "#FFD84D", learning: "#a9c3ff" } as const;

export const metadata: Metadata = {
  title: "Stack",
  description: `The tools and technologies ${site.name} works with, filed by drawer.`,
};

export default function StackPage() {
  return (
    <PageShell>
      <PageHeader page="07" kicker="records dept. · drawers A–D" title={<>The<br />stack.</>} note="filed, labelled, mostly alphabetised" />
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <SampleStamp label="sample list" />
        <Hand className="text-xl text-ink-soft">
          a starter set of tools — trim it to the truth in <code className="font-mono text-sm">src/data/skills.ts</code>
        </Hand>
      </div>
      <div className="-mt-4 mb-20 flex flex-wrap items-center gap-x-4 gap-y-6">
        {/* the key, on a little stack of index cards */}
        <PaperStack seed={11} className="order-last w-64 -rotate-2 md:order-none" colors={["#a9c3ff", "#FFD84D"]}>
          <div className="relative border-[3px] border-ink bg-paper p-3 pt-2">
            <Staple className="absolute -top-1 left-6" rotate={-5} />
            <p className="border-b-2 border-coral pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em]">key · how well I know it</p>
            <ul className="mt-2 space-y-1.5">
              {(Object.keys(levelColor) as (keyof typeof levelColor)[]).map((k) => (
                <li key={k} className="flex items-center gap-2 font-hand text-xl font-bold leading-none">
                  <span className="h-4 w-6 border-2 border-ink" style={{ background: levelColor[k] }} aria-hidden />
                  {levelLabel[k]}
                </li>
              ))}
            </ul>
          </div>
        </PaperStack>
        <span aria-hidden className="contents">
        <LabelTape>dept. of tools</LabelTape>
        <LabelTape color="bg-electric text-paper" rotate={2}>
          keep drawers closed
        </LabelTape>
        <LabelTape color="bg-coral text-ink" rotate={-1}>
          no snacks in cabinet
        </LabelTape>
        </span>
      </div>
      <h2 className="sr-only">Skills by category</h2>
      <FilingCabinet />
    </PageShell>
  );
}
