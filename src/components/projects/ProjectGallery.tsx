"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { projects, statusLabel, type ProjectStatus } from "@/data/projects";
import { Polaroid } from "@/components/diary/Polaroid";
import { cn } from "@/lib/utils";
import { play } from "@/lib/sound";

type Filter = { kind: "all" } | { kind: "status"; value: ProjectStatus } | { kind: "tech"; value: string };

export function ProjectGallery() {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const techs = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.stack.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
  }, []);
  const statuses = useMemo(() => [...new Set(projects.map((p) => p.status))], []);

  const list = projects.filter((p) =>
    filter.kind === "all" ? true : filter.kind === "status" ? p.status === filter.value : p.stack.includes(filter.value),
  );

  const chip = (active: boolean) =>
    cn(
      "border-[3px] border-ink px-3 py-1 font-mono text-xs font-bold uppercase transition-transform hover:-translate-y-0.5",
      active ? "bg-ink text-paper shadow-none translate-y-0.5" : "bg-paper shadow-brutal-sm",
    );

  const pick = (f: Filter) => {
    setFilter(f);
    play("tick");
  };

  return (
    <div>
      <div role="group" aria-label="Filter projects" className="mb-10 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-hand text-2xl font-bold">filter:</span>
        <button className={chip(filter.kind === "all")} aria-pressed={filter.kind === "all"} onClick={() => pick({ kind: "all" })}>
          All ({projects.length})
        </button>
        {statuses.map((s) => {
          const on = filter.kind === "status" && filter.value === s;
          return (
            <button key={s} className={chip(on)} aria-pressed={on} onClick={() => pick({ kind: "status", value: s })}>
              {statusLabel[s]}
            </button>
          );
        })}
        <span className="mx-1 hidden h-6 w-[3px] bg-ink/30 sm:block" aria-hidden />
        {techs.map((t) => {
          const on = filter.kind === "tech" && filter.value === t;
          return (
            <button key={t} className={chip(on)} aria-pressed={on} onClick={() => pick({ kind: "tech", value: t })}>
              #{t}
            </button>
          );
        })}
      </div>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <Polaroid key={p.slug} project={p} index={i} />
          ))}
        </AnimatePresence>
      </div>
      {list.length === 0 && <p className="font-hand text-3xl">nothing developed yet in this tray.</p>}
    </div>
  );
}
