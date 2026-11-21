import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { Receipt } from "@/components/diary/Receipt";
import { Passport } from "@/components/experience/Passport";

export const metadata: Metadata = {
  title: "Experience",
  description: `${site.name}'s professional experience, printed on one very long receipt — plus a passport of milestones.`,
};

export default function ExperiencePage() {
  return (
    <PageShell>
      <PageHeader page="04" kicker="itemised · transaction log" color="bg-paper" title={<>Exp&shy;eri&shy;ence</>} note="keep the receipt — it's itemised" />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <SampleStamp label="placeholder entries" />
        <Hand className="text-xl text-ink-soft">
          replace in <code className="font-mono text-sm">src/data/experience.ts</code>
        </Hand>
      </div>
      <section aria-labelledby="receipt">
        <h2 id="receipt" className="sr-only">Work history receipt</h2>
        <Receipt />
      </section>

      <section aria-labelledby="passport" className="mt-28">
        <SectionHeading id="passport" note="launches · hackathons · certs · milestones">Passport</SectionHeading>
        <Passport />
      </section>
    </PageShell>
  );
}
