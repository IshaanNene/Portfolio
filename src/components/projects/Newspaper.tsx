import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { tilt } from "@/lib/utils";
import { ProjectArt } from "./ProjectArt";
import { Tape } from "@/components/ui/Decor";
import { SampleStamp } from "@/components/ui/Typography";

/** "The Daily Commit" — featured work as clipped newspaper articles. */
export function Newspaper() {
  const [lead, ...rest] = featuredProjects;
  if (!lead) return null;
  return (
    <div className="relative">
      {/* masthead clipping */}
      <div className="torn-bottom relative mx-auto max-w-4xl -rotate-1 bg-[#f3efe4] px-5 pb-6 pt-5 text-center shadow-[6px_8px_0_rgba(0,0,0,.18)] sm:px-10">
        <div className="flex items-center justify-between border-b-2 border-ink pb-1 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span>Vol. CXXIV</span>
          <span className="hidden sm:inline">“All the code that&rsquo;s fit to ship”</span>
          <span>Price: 1 star ★</span>
        </div>
        <p className="mt-2 font-serif text-[clamp(2.4rem,8vw,5.2rem)] font-black leading-none tracking-tight">The Daily Commit</p>
        <div className="mt-2 border-y-4 border-double border-ink py-1 font-mono text-[10px] uppercase tracking-[0.3em]">
          Featured work · Special edition
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <article className="torn-bottom torn-top relative bg-[#f3efe4] p-6 shadow-[6px_8px_0_rgba(0,0,0,.18)]" style={{ transform: `rotate(${tilt(lead.slug, 1.2)}deg)` }}>
          <Tape className="-top-1 left-10 rotate-[-6deg]" />
          <Tape className="-top-1 right-10 rotate-[5deg]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]">Front page · {lead.year}</p>
          <h3 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-[0.95]">{lead.headline}</h3>
          <p className="mt-2 font-serif text-lg italic">{lead.summary}</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
            <figure>
              <ProjectArt project={lead} className="aspect-[4/3] w-full border-2 border-ink [filter:grayscale(1)_contrast(1.2)]" />
              <figcaption className="mt-1 font-serif text-xs italic">Fig. 1 — {lead.name}, pictured mid-deploy.</figcaption>
            </figure>
            <div className="columns-1 gap-4 text-justify font-serif text-sm leading-relaxed sm:columns-2 xl:columns-1 [hyphens:auto]">
              <p>
                <span className="float-left mr-1 font-serif text-5xl font-black leading-[0.8]">{lead.problem.replace("SAMPLE — ", "").charAt(0)}</span>
                {lead.problem.replace("SAMPLE — ", "").slice(1)}
              </p>
              <p className="mt-2">{lead.architecture.summary.replace("SAMPLE — ", "")}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link href={`/projects/${lead.slug}`} className="font-mono text-xs font-bold uppercase underline decoration-2 underline-offset-4">
              Continued on p.{lead.slug.length} →
            </Link>
            {lead.sample && <SampleStamp />}
          </div>
        </article>

        <div className="space-y-8">
          {rest.map((p, i) => (
            <article
              key={p.slug}
              className="torn-bottom relative bg-[#f3efe4] p-5 shadow-[6px_8px_0_rgba(0,0,0,.18)]"
              style={{ transform: `rotate(${tilt(p.slug + i, 2)}deg)` }}
            >
              <Tape className="-top-2 left-1/2 -translate-x-1/2 rotate-2" />
              <p className="font-mono text-[10px] uppercase tracking-[0.25em]">Tech desk · {p.year}</p>
              <h3 className="mt-1 font-serif text-2xl font-black leading-tight">{p.headline}</h3>
              <p className="mt-1 font-serif text-sm leading-relaxed">{p.summary}</p>
              <div className="mt-2 flex items-center justify-between">
                <Link href={`/projects/${p.slug}`} className="font-mono text-[11px] font-bold uppercase underline decoration-2 underline-offset-4">
                  Read the story →
                </Link>
                {p.sample && <SampleStamp />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
