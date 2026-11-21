import type { CSSProperties, ReactNode } from "react";
import { cn, seeded } from "@/lib/utils";

/**
 * Static scrapbook pieces (server-safe). Everything is drawn with CSS/SVG,
 * with deterministic "randomness" so server and client markup match.
 */

/* ───────── torn paper ───────── */

type Edge = "top" | "right" | "bottom" | "left";

/** Polygon for a clip-path with hand-torn edges. */
export function tornPolygon(seed: number, edges: Edge[] = ["top", "right", "bottom", "left"], depth = 1.6, steps = 26) {
  const r = seeded(seed * 977 + 13);
  const j = (on: boolean) => (on ? r() * depth : 0);
  const pts: string[] = [];
  const t = edges.includes("top");
  const ri = edges.includes("right");
  const b = edges.includes("bottom");
  const l = edges.includes("left");
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${j(t)}%`);
  for (let i = 1; i <= steps; i++) pts.push(`${100 - j(ri)}% ${(i / steps) * 100}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${100 - j(b)}%`);
  for (let i = steps - 1; i > 0; i--) pts.push(`${j(l)}% ${(i / steps) * 100}%`);
  return `polygon(${pts.join(",")})`;
}

/** A sheet of paper with ragged torn edges and a soft paper shadow. */
export function TornPaper({
  children,
  color = "#FBF5E8",
  seed = 1,
  edges,
  rotate = 0,
  ruled = false,
  grid = false,
  className,
  style,
}: {
  children?: ReactNode;
  color?: string;
  seed?: number;
  edges?: Edge[];
  rotate?: number;
  ruled?: boolean;
  grid?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const clip = tornPolygon(seed, edges);
  return (
    <div className={cn("relative", className)} style={{ transform: `rotate(${rotate}deg)`, filter: "drop-shadow(3px 5px 0 rgba(40,25,5,.16))", ...style }}>
      <div
        className={cn("paper-grain relative h-full w-full", ruled && "ruled", grid && "grid-paper")}
        style={{ clipPath: clip, backgroundColor: color }}
      >
        {children}
      </div>
    </div>
  );
}

/** Content sitting on a small stack of loose sheets. */
export function PaperStack({ children, className, colors = ["#efe3c8", "#f7eedb"], seed = 3 }: { children: ReactNode; className?: string; colors?: string[]; seed?: number }) {
  const r = seeded(seed);
  return (
    <div className={cn("relative", className)}>
      {colors.map((c, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0 border-[3px] border-ink"
          style={{ background: c, transform: `translate(${(i + 1) * 5}px, ${(i + 1) * 6}px) rotate(${(r() - 0.5) * 4}deg)`, zIndex: -1 - i }}
        />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ───────── sticky notes ───────── */

export const stickyColors = {
  yellow: "#FFE873",
  pink: "#B5835A",
  blue: "#A9C9FF",
  green: "#B8E89F",
} as const;

/** Generic sticky note with a folded bottom corner. */
export function StickyPaper({
  children,
  color = "yellow",
  rotate = 0,
  className,
}: {
  children: ReactNode;
  color?: keyof typeof stickyColors;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)} style={{ transform: `rotate(${rotate}deg)`, filter: "drop-shadow(4px 6px 0 rgba(0,0,0,.18))" }}>
      <div className="relative h-full p-4 pb-6" style={{ background: stickyColors[color], clipPath: "polygon(0 0,100% 0,100% 86%,86% 100%,0 100%)" }}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-5 bg-black/[.05]" />
        {children}
        <span aria-hidden className="absolute bottom-0 right-0 h-[14%] w-[14%] bg-black/15" style={{ clipPath: "polygon(0 0,100% 0,0 100%)" }} />
      </div>
    </div>
  );
}

/* ───────── fasteners ───────── */

export function Staple({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg viewBox="0 0 40 12" className={cn("pointer-events-none h-3 w-10", className)} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden>
      <path d="M3 9 V4 Q3 2 5 2 H35 Q37 2 37 4 V9" fill="none" stroke="#6f747c" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5 3 H35" stroke="#d4d8de" strokeWidth="1" />
    </svg>
  );
}

export function PushPin({ color = "#FF755E", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 30 34" className={cn("pointer-events-none h-8 w-7", className)} aria-hidden>
      <ellipse cx="17" cy="31" rx="7" ry="2.4" fill="rgba(0,0,0,.25)" />
      <path d="M15 20 L16 31" stroke="#8b9098" strokeWidth="2" />
      <circle cx="15" cy="13" r="10" fill={color} stroke="#171717" strokeWidth="2.5" />
      <circle cx="11.5" cy="9.5" r="3" fill="rgba(255,255,255,.65)" />
    </svg>
  );
}

/* ───────── labels ───────── */

/** Numbered tags, date strips, category stamps and index cards. */
export function ScrapbookLabel({
  kind,
  children,
  n,
  color = "bg-sun",
  rotate = -2,
  className,
}: {
  kind: "tag" | "date" | "category" | "index";
  children: ReactNode;
  n?: number | string;
  color?: string;
  rotate?: number;
  className?: string;
}) {
  const style = { transform: `rotate(${rotate}deg)` };
  if (kind === "tag")
    return (
      <span className={cn("relative inline-flex items-center gap-2 border-[3px] border-ink py-1 pl-6 pr-3 shadow-brutal-sm", color, className)} style={{ ...style, clipPath: "polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%)" }}>
        <span aria-hidden className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-ink bg-cream" />
        {n !== undefined && <span className="font-display text-lg font-extrabold leading-none">{String(n).padStart(2, "0")}</span>}
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">{children}</span>
      </span>
    );
  if (kind === "date")
    return (
      <span className={cn("inline-block bg-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-paper shadow-[2px_3px_0_rgba(0,0,0,.25)]", className)} style={style}>
        {children}
      </span>
    );
  if (kind === "category")
    return (
      <span
        className={cn("inline-block rounded-sm border-[3px] border-current px-2 py-0.5 font-display text-sm font-extrabold uppercase tracking-widest text-coral opacity-85", className)}
        style={{ ...style, maskImage: "radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,.65) 61%)" }}
      >
        {children}
      </span>
    );
  return (
    <div className={cn("relative w-56 border-2 border-ink/70 bg-paper p-3 pt-2 shadow-[3px_4px_0_rgba(0,0,0,.18)]", className)} style={style}>
      <div className="border-b-2 border-coral pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em]">{n ?? "index card"}</div>
      <div className="bg-[repeating-linear-gradient(180deg,transparent_0_23px,rgba(71,123,255,.3)_23px_24px)] pt-1 font-hand text-xl font-bold leading-[24px]">{children}</div>
    </div>
  );
}

/* ───────── handwritten annotations ───────── */

/** Hand-drawn ellipse around inline text. */
export function Circled({ children, color = "#FF755E", className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={cn("relative inline-block px-1", className)}>
      {children}
      <svg viewBox="0 0 120 50" preserveAspectRatio="none" className="draw pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible" aria-hidden>
        <path pathLength={1} d="M60 4 C 100 2, 118 14, 116 26 C 114 42, 70 48, 40 46 C 12 44, 2 34, 4 22 C 6 10, 30 3, 72 5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

/** Scribbled underline. */
export function Underlined({ children, color = "#477BFF", className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg viewBox="0 0 200 14" preserveAspectRatio="none" className="draw pointer-events-none absolute -bottom-2 left-0 h-3 w-full overflow-visible" aria-hidden>
        <path pathLength={1} d="M2 9 C 40 3, 80 13, 120 7 S 180 4, 198 8 M20 12 C 70 9, 130 13, 170 10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

/** Crossed-out text with a handwritten correction above it. */
export function Corrected({ wrong, right, className }: { wrong: ReactNode; right: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative text-ink/55">
        {wrong}
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="draw pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 overflow-visible" aria-hidden>
          <path pathLength={1} d="M0 12 L100 6 M2 7 L98 13" stroke="#FF755E" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap font-hand text-xl font-bold leading-none text-coral">{right}</span>
    </span>
  );
}

/** Curvy hand-drawn arrow. `dir` flips it. */
export function HandArrow({ className, flip = false, color = "#171717" }: { className?: string; flip?: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={cn("draw pointer-events-none h-12 w-20 overflow-visible", className)} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path pathLength={1} d="M6 10 C 30 60, 80 64, 108 40" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path pathLength={1} d="M92 34 L110 39 L104 56" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Little doodles that redraw themselves on hover. */
export function Doodle({ kind, className, color = "#171717" }: { kind: "spiral" | "star" | "heart" | "bulb" | "rocket"; className?: string; color?: string }) {
  const d = {
    spiral: "M50 50 m0 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0 a20 20 0 1 1 40 0",
    star: "M50 8 L61 38 L93 39 L67 58 L77 90 L50 71 L23 90 L33 58 L7 39 L39 38 Z",
    heart: "M50 86 C 10 58, 8 24, 32 18 C 44 15, 50 26, 50 32 C 50 26, 56 15, 68 18 C 92 24, 90 58, 50 86 Z",
    bulb: "M38 72 C 20 58, 22 22, 50 20 C 78 22, 80 58, 62 72 L 62 82 L 38 82 Z M40 88 H60 M43 94 H57 M50 10 V2 M20 24 L13 17 M80 24 L87 17",
    rocket: "M50 8 C 68 24, 70 54, 62 72 H38 C 30 54, 32 24, 50 8 Z M38 60 L24 78 L38 74 M62 60 L76 78 L62 74 M44 80 L50 94 L56 80 M50 34 a6 6 0 1 0 0.1 0",
  }[kind];
  return (
    <svg viewBox="0 0 100 100" className={cn("redraw pointer-events-auto h-14 w-14", className)} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
    </svg>
  );
}
