"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { siGithub } from "simple-icons";
import type { Project } from "@/data/projects";
import { statusLabel } from "@/data/projects";
import { play } from "@/lib/sound";
import { tilt } from "@/lib/utils";
import { ProjectArt } from "@/components/projects/ProjectArt";
import { SampleStamp } from "@/components/ui/Typography";
import { Washi, type WashiPattern } from "@/components/ui/Scrapbook";
import { Staple } from "@/components/scrapbook/pieces";

const WASHI: [WashiPattern, string][] = [
  ["stripe", "#FF755E"],
  ["dots", "#477BFF"],
  ["grid", "#9DDC8B"],
  ["check", "#FFD84D"],
];

const statusColor: Record<Project["status"], string> = {
  shipped: "#9DDC8B",
  "in-progress": "#FFD84D",
  prototype: "#a9c3ff",
  archived: "#d9d2c3",
};

export function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={path} />
    </svg>
  );
}

/** A project as a Polaroid: photo "develops" on hover and the card straightens. */
export function Polaroid({ project, index }: { project: Project; index: number }) {
  const rot = tilt(project.slug, 4);
  const [pattern, tapeColor] = WASHI[index % WASHI.length];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, rotate: rot * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: index * 0.05 }}
      onHoverStart={() => play("tick")}
      className="group relative border-[3px] border-ink bg-paper p-3 pb-4 shadow-brutal-lg sm:[margin-top:var(--drop)] xl:-mx-3 hover:z-20"
      style={{ ["--drop" as string]: `${[0, 34, 12][index % 3]}px` }}
    >
      <Washi pattern={pattern} color={tapeColor} className={index % 2 ? "-top-3 -left-4 -rotate-[30deg]" : "-top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]"} />
      {index % 2 === 1 && <Washi pattern={pattern} color={tapeColor} className="-right-4 -top-3 rotate-[28deg]" />}
      <Link href={`/projects/${project.slug}`} className="block" aria-label={`Open case file: ${project.name}`}>
        <div className="relative overflow-hidden border-[3px] border-ink">
          <ProjectArt
            project={project}
            className="aspect-[4/3] w-full object-cover transition-[filter] duration-700 [filter:sepia(.55)_saturate(.6)_brightness(1.05)] group-hover:[filter:none]"
          />
          <span
            className="absolute right-2 top-2 border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
            style={{ background: statusColor[project.status] }}
          >
            {statusLabel[project.status]}
          </span>
          {project.sample && <SampleStamp className="absolute bottom-2 left-2 bg-paper/90" />}
        </div>
        <h3 className="mt-3 font-hand text-3xl font-bold leading-none">{project.name}</h3>
        <p className="mt-1.5 text-sm leading-snug">{project.summary}</p>
      </Link>
      {/* the stack, scribbled on a sticky stapled to the photo */}
      <div className="relative -mx-1 mt-3 bg-[#FFE873] p-2 pt-3 shadow-[2px_3px_0_rgba(0,0,0,.15)]" style={{ transform: `rotate(${-rot * 0.4}deg)` }}>
        <Staple className="absolute -top-1.5 left-3" rotate={-6} />
        <p className="font-hand text-base font-bold leading-none text-ink-soft">tech notes:</p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Technology stack">
          {project.stack.map((t) => (
            <li key={t} className="border-2 border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase">
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1 border-[3px] border-ink bg-sun px-3 py-1.5 font-display text-xs font-extrabold uppercase shadow-brutal-sm transition-transform hover:-translate-y-0.5"
        >
          Case file <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} on GitHub`}
            className="grid h-9 w-9 place-items-center border-[3px] border-ink bg-paper shadow-brutal-sm transition-transform hover:-rotate-6"
          >
            <BrandIcon path={siGithub.path} className="h-4 w-4" />
          </a>
        )}
        {project.links.demo && (
          <a
            href={project.links.demo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} live demo`}
            className="grid h-9 w-9 place-items-center border-[3px] border-ink bg-grass shadow-brutal-sm transition-transform hover:rotate-6"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </motion.article>
  );
}
