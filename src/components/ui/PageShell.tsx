import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageCorner } from "@/components/scrapbook/interactive";
import { TornPaper } from "@/components/scrapbook/pieces";
import { Washi } from "./Scrapbook";

/** Content column that leaves room for the bookmark ribbons and top buttons. */
export function PageShell({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div className={cn("relative mx-auto w-full px-4 pt-16 sm:px-8 md:pr-40 md:pt-20", wide ? "max-w-[90rem]" : "max-w-7xl", className)}>
      {/* stray paper scraps in the desk margins (very wide screens only) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 -left-44 hidden w-40 2xl:block">
        <TornPaper seed={41} color="#B5835A" rotate={-8} className="absolute top-[30rem] h-28 w-32 opacity-80" />
        <TornPaper seed={42} color="#FBF5E8" rotate={6} ruled className="absolute top-[58rem] h-40 w-36" />
        <Washi pattern="dots" color="#3E5C76" className="top-[57.5rem] left-10 rotate-12" />
        <TornPaper seed={43} color="#A9C9FF" rotate={-3} className="absolute top-[90rem] h-24 w-28 opacity-80" />
      </div>
      {children}
      <PageCorner />
    </div>
  );
}
