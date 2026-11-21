import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Hand, ScribbleArrow } from "./Typography";
import { PostageStamp, StarSticker, Washi, type WashiPattern } from "./Scrapbook";

const WASHI: { color: string; pattern: WashiPattern }[] = [
  { color: "#D2693A", pattern: "stripe" },
  { color: "#3E5C76", pattern: "dots" },
  { color: "#8FA05A", pattern: "grid" },
  { color: "#D9A441", pattern: "check" },
];

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
  const n = Number.parseInt(page, 10) || 0;
  const tape = WASHI[n % WASHI.length];
  const bg = color.split(" ").find((c) => c.startsWith("bg-")) ?? "bg-sun";
  return (
    <header className={cn("relative mb-10 pt-6 sm:mb-14 sm:pt-10 xl:min-h-[21rem]", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className={cn("brutal-sm relative px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.2em]", color)}>
          p.{page}
          <Washi pattern={tape.pattern} color={tape.color} className="-left-4 -top-3 !h-5 !w-12 -rotate-[24deg]" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft">{kicker}</span>
      </div>
      {/* torn scrap of coloured paper glued behind the title */}
      <span
        aria-hidden
        className={cn("torn-bottom torn-top absolute -left-3 top-[4.6rem] -z-0 h-[clamp(3rem,9vw,7.2rem)] w-[min(78%,34rem)] -rotate-[1.5deg] opacity-45 sm:top-[5.6rem]", bg)}
      />
      <h1 className="relative max-w-[14ch] text-[clamp(3.2rem,11vw,9rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.04em]">
        {title}
      </h1>
      {note && (
        <div className="mt-4 flex items-start gap-1 text-coral sm:absolute sm:right-4 sm:top-16 sm:mt-0 sm:max-w-[16rem] sm:rotate-3">
          <ScribbleArrow className="mt-1 hidden shrink-0 -scale-x-100 rotate-[150deg] sm:block" />
          <Hand className="text-2xl text-ink">{note}</Hand>
        </div>
      )}
      {/* desk clutter on wide screens */}
      <div aria-hidden className="pointer-events-none absolute right-16 top-44 hidden xl:block">
        <PostageStamp value={`${n * 5 || 1}¢`} label={kicker.split("·")[0].trim()} color={bg === "bg-paper" ? "bg-sun" : bg} rotate={n % 2 ? 7 : -6} />
        <StarSticker color={WASHI[(n + 2) % WASHI.length].color} className="absolute -bottom-6 -left-8 h-12 w-12 rotate-12" />
      </div>
      {children}
    </header>
  );
}
