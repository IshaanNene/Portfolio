import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Hand, ScribbleArrow } from "./Typography";

/**
 * The big title block every diary page opens with:
 * page number tab, oversized title, handwritten aside.
 */
export function PageHeader({
  page,
  title,
  kicker,
  note,
  color = "bg-sun",
  children,
  className,
}: {
  page: string;
  title: ReactNode;
  kicker: string;
  note?: string;
  color?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative mb-10 pt-6 sm:mb-14 sm:pt-10", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={cn("brutal-sm px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.2em]", color)}>
          p.{page}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">{kicker}</span>
      </div>
      <h1 className="max-w-[14ch] text-[clamp(3.2rem,11vw,9rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
        {title}
      </h1>
      {note && (
        <div className="mt-4 flex items-start gap-1 text-coral sm:absolute sm:right-4 sm:top-16 sm:mt-0 sm:max-w-[16rem] sm:rotate-3">
          <ScribbleArrow className="mt-1 hidden shrink-0 -scale-x-100 rotate-[150deg] sm:block" />
          <Hand className="text-2xl text-ink">{note}</Hand>
        </div>
      )}
      {children}
    </header>
  );
}
