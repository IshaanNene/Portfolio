import Link from "next/link";
import { navItems } from "@/config/nav";
import { PageShell } from "@/components/ui/PageShell";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="relative mx-auto mt-10 max-w-2xl">
        <div className="torn-bottom torn-top relative -rotate-2 bg-[#fbf5e8] p-8 shadow-brutal-lg ruled sm:p-12 sm:pl-20">
          <p className="font-mono text-xs uppercase tracking-[0.3em]">p.404</p>
          <h1 className="mt-2 text-[clamp(3rem,12vw,7rem)] font-extrabold uppercase leading-[0.85]">Page ripped out.</h1>
          <p className="mt-4 font-hand text-3xl font-bold leading-tight">
            someone tore this page out of the diary. (it was probably me. it had a bug on it.)
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="coral">
              Back to the cover
            </ButtonLink>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase">
            {navItems.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="underline decoration-2 underline-offset-4">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
