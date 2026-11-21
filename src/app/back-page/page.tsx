import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackPage } from "@/components/eggs/BackPage";

export const metadata: Metadata = {
  title: "The back page",
  description: "You weren't supposed to find this.",
  robots: { index: false, follow: false },
};

export default function BackPageRoute() {
  return (
    <PageShell>
      <div className="relative">
        <PageHeader page="∞" kicker="not in the table of contents" color="bg-ink text-paper" title={<>The back<br />page.</>} note="well well well. look who found it." />
      </div>
      <BackPage />
    </PageShell>
  );
}
