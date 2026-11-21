import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Envelope } from "@/components/diary/Envelope";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — email, GitHub, LinkedIn or a letter.`,
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader page="09" kicker="post office" color="bg-grass" title={<>Say<br />hello.</>} note="sealed with actual (digital) wax" />
      <h2 className="sr-only">Contact details and form</h2>
      <div className="pb-16">
        <Envelope />
      </div>
    </PageShell>
  );
}
