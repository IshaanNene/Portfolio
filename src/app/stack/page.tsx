import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { FilingCabinet } from "@/components/stack/FilingCabinet";

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
      <h2 className="sr-only">Skills by category</h2>
      <FilingCabinet />
    </PageShell>
  );
}
