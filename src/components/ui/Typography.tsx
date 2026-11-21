import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Hand({ children, className, as: Tag = "span" }: { children: ReactNode; className?: string; as?: "span" | "p" | "div" }) {
  return <Tag className={cn("font-hand text-2xl font-semibold leading-tight", className)}>{children}</Tag>;
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em]", className)}>
      {children}
    </span>
  );
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-xs uppercase tracking-[0.18em]", className)}>{children}</span>;
}

/** Hand-drawn arrow SVG used for annotations. */
export function ScribbleArrow({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 60" className={cn("h-10 w-20", className)} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M6 44 C 30 10, 70 6, 104 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M92 12 L106 25 L88 32" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small rubber "SAMPLE" stamp marking placeholder content. */
export function SampleStamp({ className, label = "sample" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none inline-block -rotate-6 border-2 border-coral px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-coral opacity-90",
        className,
      )}
      title="Placeholder content — replace in /src/data or /src/config"
    >
      {label}
    </span>
  );
}
