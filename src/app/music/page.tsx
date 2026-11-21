import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GuitarCorner, RecordCrate, Turntable } from "@/components/music/Music";

export const metadata: Metadata = {
  title: "Music",
  description: `What ${site.name} is listening to, favourite records and the guitar corner.`,
};

export default function MusicPage() {
  return (
    <PageShell>
      <PageHeader page="10" kicker="side B · the record shelf" color="bg-[#B5835A]" title={<>Mu&shy;sic.</>} note="the non-technical page. mostly." />

      <section aria-labelledby="turntable">
        <SectionHeading id="turntable" note="what's on right now">The turntable</SectionHeading>
        <Turntable />
      </section>

      <section aria-labelledby="crate" className="mt-28">
        <SectionHeading id="crate" note="records I keep coming back to">The crate</SectionHeading>
        <RecordCrate />
      </section>

      <section aria-labelledby="guitar" className="mt-28">
        <SectionHeading id="guitar" note="I play guitar. badly, then less badly.">Guitar corner</SectionHeading>
        <GuitarCorner />
      </section>
    </PageShell>
  );
}
