import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { siGithub } from "simple-icons";
import { getProject, projects, statusLabel } from "@/data/projects";
import { PageShell } from "@/components/ui/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hand, SampleStamp } from "@/components/ui/Typography";
import { RubberStamp, Tape } from "@/components/ui/Decor";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectArt } from "@/components/projects/ProjectArt";
import { BrandIcon } from "@/components/diary/Polaroid";
import { tilt } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.name, description: p.summary };
}

const clean = (s: string) => s.replace(/^SAMPLE — /, "");

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = projects.findIndex((x) => x.slug === slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const shots = p.screenshots?.length ? p.screenshots : [{ caption: "Screenshot" }];

  return (
    <PageShell>
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs uppercase tracking-[0.2em]">
        <Link href="/projects" className="inline-flex items-center gap-1 underline decoration-2 underline-offset-4">
          <ArrowLeft className="h-3.5 w-3.5" /> all projects
        </Link>
      </nav>

      {/* manila folder */}
      <article className="relative">
        <div className="relative ml-4 inline-block border-[3px] border-b-0 border-ink bg-[#e8c98f] px-6 pb-2 pt-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
          case file #{String(idx + 1).padStart(3, "0")}
        </div>
        <div className="relative border-[3px] border-ink bg-[#e8c98f] p-4 shadow-brutal-lg sm:p-8">
          <div className="paper-grain relative bg-[#fbf7ee] p-5 shadow-[4px_4px_0_rgba(0,0,0,.15)] sm:p-10">
            <Tape className="-top-3 right-16 rotate-6" />
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">
                  {p.year} · {p.role}
                </p>
                <h1 className="mt-2 text-[clamp(2.6rem,8vw,6rem)] font-extrabold uppercase leading-[0.85]">{p.name}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed">{p.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <RubberStamp color={p.status === "shipped" ? "#2f8a3a" : "#FF755E"}>{statusLabel[p.status]}</RubberStamp>
                {p.sample && <SampleStamp label="sample case" />}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {p.links.github && (
                <ButtonLink href={p.links.github} external variant="paper">
                  <BrandIcon path={siGithub.path} className="h-4 w-4" /> GitHub
                </ButtonLink>
              )}
              {p.links.demo && (
                <ButtonLink href={p.links.demo} external variant="grass">
                  Live demo <ExternalLink className="h-4 w-4" />
                </ButtonLink>
              )}
            </div>

            <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_18rem]">
              <div className="space-y-16">
                <section aria-labelledby="problem">
                  <SectionHeading id="problem" note="why this exists">Problem</SectionHeading>
                  <p className="max-w-2xl font-mono text-[15px] leading-7">{clean(p.problem)}</p>
                </section>

                <section aria-labelledby="arch">
                  <SectionHeading id="arch" note="napkin sketch, cleaned up">Architecture</SectionHeading>
                  <div className="grid-paper border-[3px] border-ink bg-paper p-5">
                    <ol className="flex flex-wrap items-center gap-y-4">
                      {p.architecture.nodes.map((n, i) => (
                        <li key={n.label + i} className="flex items-center">
                          <div
                            className="min-w-28 border-[3px] border-ink bg-sun px-3 py-2 text-center shadow-brutal-sm"
                            style={{ transform: `rotate(${tilt(n.label + i, 2)}deg)`, background: i % 2 ? "#fff" : p.palette[0] }}
                          >
                            <span className="block font-display text-sm font-extrabold uppercase">{n.label}</span>
                            {n.note && <span className="block font-hand text-lg leading-none">{n.note}</span>}
                          </div>
                          {i < p.architecture.nodes.length - 1 && (
                            <svg viewBox="0 0 60 20" className="mx-1 h-5 w-10 shrink-0" aria-hidden>
                              <path d="M2 10 Q 30 4 52 10" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round" />
                              <path d="M44 3 L54 10 L44 17" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round" />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-5 text-sm leading-relaxed">{clean(p.architecture.summary)}</p>
                  </div>
                </section>

                <section aria-labelledby="decisions">
                  <SectionHeading id="decisions" note="and the trade-offs">Technical decisions</SectionHeading>
                  <ul className="grid gap-5 sm:grid-cols-2">
                    {p.decisions.map((d, i) => (
                      <li
                        key={i}
                        className="relative p-4 shadow-[5px_6px_0_rgba(0,0,0,.2)]"
                        style={{ background: ["#FFD84D", "#9DDC8B", "#a9c3ff"][i % 3], transform: `rotate(${tilt(i + 9, 2)}deg)` }}
                      >
                        <p className="font-display text-lg font-extrabold uppercase leading-tight">{d.title}</p>
                        <p className="mt-1 font-hand text-xl font-semibold leading-tight">{clean(d.why)}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="shots">
                  <SectionHeading id="shots" note="taped in">Screenshots</SectionHeading>
                  <ul className="grid gap-8 sm:grid-cols-2">
                    {shots.map((s, i) => (
                      <li key={i} className="relative border-[3px] border-ink bg-paper p-2 pb-3 shadow-brutal" style={{ transform: `rotate(${tilt(i + 2, 2.5)}deg)` }}>
                        <Tape className="-top-3 left-6 -rotate-12" />
                        {s.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.src} alt={s.caption} loading="lazy" className="aspect-[4/3] w-full border-2 border-ink object-cover" />
                        ) : (
                          <ProjectArt project={p} variant={i + 1} className="aspect-[4/3] w-full border-2 border-ink" label={`${s.caption} (placeholder)`} />
                        )}
                        <Hand className="mt-2 block text-xl">{s.caption}</Hand>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="challenges">
                  <SectionHeading id="challenges" note="the bruises">Key engineering challenges</SectionHeading>
                  <ol className="space-y-6">
                    {p.challenges.map((c, i) => (
                      <li key={i} className="torn-bottom relative bg-paper p-5 pl-16 shadow-[5px_6px_0_rgba(0,0,0,.15)]">
                        <span className="absolute left-4 top-4 font-display text-4xl font-extrabold text-coral">{i + 1}</span>
                        <p className="font-display text-lg font-extrabold uppercase">{c.title}</p>
                        <p className="mt-1 text-sm leading-relaxed">{clean(c.detail)}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section aria-labelledby="results" className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <SectionHeading id="results" as="h2">Results</SectionHeading>
                    <ul className="space-y-2">
                      {p.results.map((r, i) => (
                        <li key={i} className="flex gap-2 font-hand text-2xl font-semibold leading-tight">
                          <span className="text-[#2f8a3a]">✔</span> {clean(r)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <SectionHeading as="h2">Learnings</SectionHeading>
                    <ul className="space-y-2">
                      {p.learnings.map((r, i) => (
                        <li key={i} className="flex gap-2 font-hand text-2xl font-semibold leading-tight">
                          <span className="text-electric">✎</span> {clean(r)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <div className="border-[3px] border-ink bg-cream p-4 shadow-brutal">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Technologies used</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {p.stack.map((t) => (
                      <li key={t} className="border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs uppercase" style={{ transform: `rotate(${tilt(t, 3)}deg)` }}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <ProjectArt project={p} className="w-full rotate-2 border-[3px] border-ink shadow-brutal" />
              </aside>
            </div>
          </div>
        </div>
      </article>

      <nav aria-label="More projects" className="mt-12 flex flex-wrap justify-between gap-4">
        <ButtonLink href={`/projects/${prev.slug}`} variant="paper">
          <ArrowLeft className="h-4 w-4" /> {prev.name}
        </ButtonLink>
        <ButtonLink href={`/projects/${next.slug}`} variant="sun">
          {next.name} <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </nav>
    </PageShell>
  );
}
