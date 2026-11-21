import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Hand } from "@/components/ui/Typography";
import { Checklist } from "@/components/learning/Checklist";
import { GoldStarChart } from "@/components/learning/GoldStarChart";

export const metadata: Metadata = {
  title: "Learning",
  description: `What ${site.name} has learned, is exploring and wants to learn next.`,
};

export default function LearningPage() {
  return (
    <PageShell>
      <PageHeader page="08" kicker="the to-do notebook" color="bg-coral" title={<>Learn&shy;ing.</>} note="go on, tick a box. it's oddly satisfying" />
      <h2 className="sr-only">Learning checklist</h2>
      <Checklist />
      <section aria-label="Sticker chart" className="mx-auto mt-16 max-w-3xl -rotate-[0.6deg]">
        <GoldStarChart />
      </section>
      <Hand as="p" className="mx-auto mt-10 max-w-xl text-center text-ink-soft">
        your ticks live only in your browser — the real list lives in <code className="font-mono text-sm">src/data/learning.ts</code>
      </Hand>
    </PageShell>
  );
}
