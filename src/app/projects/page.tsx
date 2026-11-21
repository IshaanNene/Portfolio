import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { Newspaper } from "@/components/projects/Newspaper";
import { CautionTape } from "@/components/ui/Scrapbook";

export const metadata: Metadata = {
  title: "Projects",
  description: `Projects by ${site.name} — a Polaroid gallery of things built, shipped and broken.`,
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <PageHeader page="03" kicker="the darkroom" color="bg-coral" title={<>Pro&shy;jects</>} note="hover to develop the photos" />
      <section aria-labelledby="gallery">
        <h2 id="gallery" className="sr-only">Project gallery</h2>
        <ProjectGallery />
      </section>
      <CautionTape text="work in progress · mind the wet paint" className="mt-24" />
      <section aria-labelledby="press" className="mt-20">
        <SectionHeading id="press" note="clippings I keep on the fridge">In the press</SectionHeading>
        <Newspaper />
      </section>
    </PageShell>
  );
}
