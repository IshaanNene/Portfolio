import Link from "next/link";
import { colorClass, navItems } from "@/config/nav";
import { site } from "@/config/site";
import { HomeExperience } from "@/components/home/HomeExperience";
import { PageShell } from "@/components/ui/PageShell";
import { Hand } from "@/components/ui/Typography";
import { Tape } from "@/components/ui/Decor";
import { tilt } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <HomeExperience />

      <PageShell className="!pt-10">
        <section id="index" aria-labelledby="index-title" className="scroll-mt-10">
          <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">p.01 — cover notes</p>
              <h2 id="index-title" className="mt-3 text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.85]">
                Hi, I&rsquo;m <span className="highlighter">{site.firstName}</span>.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed">
                {site.role} · {site.location}. {site.tagline}
              </p>
              <Hand as="p" className="mt-4 max-w-md text-2xl text-electric">
                this site is my diary — every tab sticking out of the side is a different page. go on, flip through.
              </Hand>
            </div>
            <div className="relative rotate-1 border-[3px] border-ink bg-paper p-5 shadow-brutal-lg">
              <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <p className="font-display text-xl font-extrabold uppercase">Table of contents</p>
              <ol className="mt-3 divide-y-2 divide-dashed divide-ink/20">
                {navItems.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="group flex items-baseline gap-3 py-2">
                      <span className="font-mono text-xs">{n.page}</span>
                      <span className="font-display text-lg font-extrabold uppercase group-hover:underline group-hover:decoration-coral group-hover:decoration-4">
                        {n.label}
                      </span>
                      <span className="ml-auto font-hand text-lg text-ink-soft">{n.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ul className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {navItems.map((n, i) => (
              <li key={n.href} style={{ transform: `rotate(${tilt(i + 3, 2.5)}deg)` }}>
                <Link
                  href={n.href}
                  className={`brutal flex aspect-square flex-col justify-between p-4 transition-transform hover:-translate-y-1 hover:rotate-0 ${colorClass[n.color]}`}
                >
                  <span className="font-mono text-xs">p.{n.page}</span>
                  <span className="font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </>
  );
}
