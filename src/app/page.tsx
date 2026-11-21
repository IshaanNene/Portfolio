import { HomeExperience } from "@/components/home/HomeExperience";
import { HomeSpread } from "@/components/home/HomeSpread";
import { PageShell } from "@/components/ui/PageShell";

export default function Home() {
  return (
    <>
      <HomeExperience />
      <PageShell className="!pt-10">
        <HomeSpread />
      </PageShell>
    </>
  );
}
