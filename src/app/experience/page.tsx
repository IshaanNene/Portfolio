import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Receipt } from "@/components/diary/Receipt";
import { Passport } from "@/components/experience/Passport";
import { LuggageTag, PostageStamp } from "@/components/ui/Scrapbook";
import { PaperClip } from "@/components/ui/Decor";
import { careerMilestones } from "@/data/experience";
import { ScrapbookLabel } from "@/components/scrapbook/pieces";
import { SecretStamp } from "@/components/scrapbook/interactive";

const clean = (s: string) => s.replace(/^\[|\]$/g, "");

export const metadata: Metadata = {
  title: "Experience",
  description: `${site.name}'s professional experience, printed on one very long receipt — plus a passport of milestones.`,
};

export default function ExperiencePage() {
  return (
    <PageShell>
      <PageHeader page="04" kicker="itemised · transaction log" color="bg-paper" title={<>Exp&shy;eri&shy;ence</>} note="keep the receipt — it's itemised" />
      <section aria-labelledby="receipt" className="relative">
        <h2 id="receipt" className="sr-only">Work history receipt</h2>
        {/* milestones clipped to the left of the receipt */}
        <div className="absolute left-0 top-28 hidden w-60 xl:block">
          <div className="relative">
            <PaperClip className="absolute -top-6 left-8 z-10 rotate-[-8deg]" />
            <ScrapbookLabel kind="index" n="milestones" rotate={-3}>
              {careerMilestones.map((m) => (
                <span key={m.label} className="block">
                  {clean(m.date)} — {clean(m.label)}
                </span>
              ))}
            </ScrapbookLabel>
          </div>
          <div className="mt-10 flex flex-col items-start gap-4">
            {["joined", "shipped", "levelled up"].map((t, i) => (
              <ScrapbookLabel key={t} kind="tag" n={i + 1} rotate={[-4, 3, -1][i]} color={["bg-sun", "bg-grass", "bg-[#a9c3ff]"][i]}>
                {t}
              </ScrapbookLabel>
            ))}
          </div>
        </div>
        {/* stamps on the right */}
        <div className="absolute right-4 top-32 hidden flex-col items-center gap-16 xl:flex">
          <PostageStamp value="01" label="itemised" color="bg-sun" rotate={-8} postmark={false} />
          <SecretStamp
            label="Audited"
            mark="checked"
            color="#FF755E"
            secret={<>no padded numbers on this receipt. every line is real, or marked as a placeholder.</>}
          />
        </div>
        <Receipt />
      </section>

      <section aria-labelledby="passport" className="relative mt-28">
        <div className="absolute right-6 top-6 z-10 hidden rotate-6 xl:block">
          <LuggageTag
            lines={[
              ["from", "the receipt above"],
              ["to", "wherever's next"],
              ["contents", "fragile ideas"],
            ]}
          />
        </div>
        <SectionHeading id="passport" note="launches · hackathons · certs · milestones">Passport</SectionHeading>
        <Passport />
      </section>
    </PageShell>
  );
}
