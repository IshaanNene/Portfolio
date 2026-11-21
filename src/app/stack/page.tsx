import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { FilingCabinet } from "@/components/stack/FilingCabinet";
import { LabelTape } from "@/components/ui/Scrapbook";

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
      <div className="-mt-4 mb-10 flex flex-wrap items-center gap-4" aria-hidden>
        <LabelTape>dept. of tools</LabelTape>
        <LabelTape color="bg-electric text-paper" rotate={2}>
          keep drawers closed
        </LabelTape>
        <LabelTape color="bg-coral text-ink" rotate={-1}>
          no snacks in cabinet
        </LabelTape>
      </div>
      <h2 className="sr-only">Skills by category</h2>
      <FilingCabinet />
    </PageShell>
  );
}
