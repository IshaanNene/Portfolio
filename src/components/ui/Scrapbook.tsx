import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scrapbook odds and ends — patterned washi, postage stamps, stickers,
 * caution tape, tags. Purely decorative (aria-hidden) unless noted.
 */

export type WashiPattern = "stripe" | "dots" | "grid" | "check";

const PATTERNS: Record<WashiPattern, (c: string) => string> = {
  stripe: (c) => `repeating-linear-gradient(45deg, ${c} 0 9px, rgba(255,255,255,.55) 9px 15px)`,
  dots: (c) => `radial-gradient(circle, rgba(255,255,255,.7) 2.6px, transparent 3px) 0 0 / 12px 12px, ${c}`,
  grid: (c) =>
    `linear-gradient(rgba(255,255,255,.55) 2px, transparent 2px) 0 0 / 10px 10px, linear-gradient(90deg, rgba(255,255,255,.55) 2px, transparent 2px) 0 0 / 10px 10px, ${c}`,
  check: (c) => `repeating-conic-gradient(${c} 0 25%, rgba(255,255,255,.55) 0 50%) 0 0 / 14px 14px, ${c}`,
};

/** Patterned washi tape strip. Position it with className. */
export function Washi({
  pattern = "stripe",
  color = "#FF755E",
  className,
  style,
}: {
  pattern?: WashiPattern;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <span aria-hidden className={cn("tape", className)} style={{ background: PATTERNS[pattern](color), opacity: 0.8, ...style }} />;
}

const PERFORATION =
  "linear-gradient(#000 0 0) center / calc(100% - 10px) calc(100% - 10px) no-repeat, radial-gradient(circle, transparent 3.2px, #000 3.7px) -5px -5px / 10px 10px";

/** Postage stamp with perforated edges and a tiny landscape. */
export function PostageStamp({
  value,
  label,
  color = "bg-coral",
  className,
  rotate = 6,
  postmark = true,
}: {
  value: string;
  label: string;
  color?: string;
  className?: string;
  rotate?: number;
  postmark?: boolean;
}) {
  return (
    <span aria-hidden className={cn("relative inline-block", className)} style={{ transform: `rotate(${rotate}deg)` }}>
      <span className="block bg-paper p-[9px] drop-shadow-[3px_4px_0_rgba(0,0,0,.22)]" style={{ WebkitMask: PERFORATION, mask: PERFORATION }}>
        <span className={cn("relative flex h-[7.5rem] w-[6.25rem] flex-col justify-between overflow-hidden border-2 border-ink p-1.5", color)}>
          <span className="relative z-10 font-display text-2xl font-extrabold leading-none">{value}</span>
          <svg viewBox="0 0 100 60" className="absolute inset-x-0 bottom-5 w-full" aria-hidden>
            <circle cx="66" cy="20" r="11" fill="rgba(255,255,255,.85)" />
            <path d="M0 60 Q20 28 42 46 T100 38 V60 Z" fill="rgba(23,23,23,.82)" />
          </svg>
          <span className="relative z-10 truncate bg-ink px-1 font-mono text-[8px] uppercase tracking-widest text-paper">{label}</span>
        </span>
      </span>
      {postmark && (
        <svg viewBox="0 0 140 80" className="pointer-events-none absolute -right-16 top-2 w-32 opacity-60" aria-hidden>
          <g fill="none" stroke="#2a3d8f" strokeWidth="2.5">
            <circle cx="34" cy="36" r="28" />
            <circle cx="34" cy="36" r="21" />
            {[0, 1, 2, 3].map((k) => (
              <path key={k} d={`M66 ${20 + k * 10} q8 -6 16 0 t16 0 t16 0 t16 0`} />
            ))}
          </g>
          <text x="34" y="34" textAnchor="middle" fontSize="7.5" fontFamily="var(--font-mono)" fill="#2a3d8f" fontWeight="700">
            DEV DIARY
          </text>
          <text x="34" y="45" textAnchor="middle" fontSize="7.5" fontFamily="var(--font-mono)" fill="#2a3d8f" fontWeight="700">
            ★ 2026 ★
          </text>
        </svg>
      )}
    </span>
  );
}

/** Vinyl star sticker with a white die-cut border. */
export function StarSticker({ color = "#FFD84D", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("h-10 w-10", className)} aria-hidden>
      <path
        d="M50 6 61 37 94 38 68 58 77 91 50 72 23 91 32 58 6 38 39 37Z"
        fill={color}
        stroke="#fff"
        strokeWidth="14"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path d="M50 6 61 37 94 38 68 58 77 91 50 72 23 91 32 58 6 38 39 37Z" fill="none" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

/** Coffee-cup ring stain. */
export function CoffeeRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("pointer-events-none h-28 w-28", className)} aria-hidden>
      <g fill="none" stroke="rgba(120,70,25,.18)" strokeLinecap="round">
        <path d="M60 10a50 50 0 1 1-46 30" strokeWidth="7" />
        <path d="M60 16a44 44 0 1 1-30 12" strokeWidth="3" />
        <circle cx="18" cy="30" r="3" fill="rgba(120,70,25,.15)" stroke="none" />
      </g>
    </svg>
  );
}

/** Full-bleed black-and-yellow caution tape with a repeating message. */
export function CautionTape({ text, className, rotate = -1.2 }: { text: string; className?: string; rotate?: number }) {
  const run = Array.from({ length: 8 }, () => text).join("  ✦  ");
  return (
    <div aria-hidden className={cn("relative -mx-4 overflow-hidden sm:-mx-8", className)} style={{ transform: `rotate(${rotate}deg)` }}>
      <div
        className="flex h-11 items-center whitespace-nowrap border-y-[3px] border-ink font-display text-sm font-extrabold uppercase tracking-[0.2em] shadow-brutal"
        style={{ background: "repeating-linear-gradient(-45deg, #FFD84D 0 22px, #171717 22px 44px)" }}
      >
        <span className="mx-auto bg-sun px-3 py-0.5">{run}</span>
      </div>
    </div>
  );
}

/** Brown luggage tag on a string. */
export function LuggageTag({ lines, className }: { lines: [string, string][]; className?: string }) {
  return (
    <div aria-hidden className={cn("relative w-56", className)}>
      <svg viewBox="0 0 60 90" className="absolute -top-20 left-6 h-24 w-12" aria-hidden>
        <path d="M30 90 C 10 60, 50 40, 26 0" fill="none" stroke="#171717" strokeWidth="2.5" />
      </svg>
      <div
        className="relative border-[3px] border-ink bg-kraft p-4 pt-9 shadow-brutal"
        style={{ clipPath: "polygon(22% 0, 78% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)" }}
      >
        <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-ink bg-cream" />
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.3em]">Luggage tag</p>
        <dl className="mt-2 space-y-1.5">
          {lines.map(([k, v]) => (
            <div key={k} className="border-b-2 border-dashed border-ink/40 pb-1">
              <dt className="font-mono text-[9px] uppercase tracking-widest text-ink/70">{k}</dt>
              <dd className="font-hand text-xl font-bold leading-none">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** "HELLO my name is" conference sticker. */
export function NameTag({ name, className }: { name: string; className?: string }) {
  return (
    <div aria-hidden className={cn("w-60 overflow-hidden rounded-xl border-[3px] border-ink bg-paper shadow-brutal", className)}>
      <div className="bg-coral px-3 pb-2 pt-2 text-center text-paper">
        <p className="font-display text-3xl font-extrabold leading-none tracking-tight">HELLO</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">my name is</p>
      </div>
      <p className="px-3 py-4 text-center font-hand text-5xl font-bold leading-none text-electric">{name}</p>
      <div className="h-3 bg-coral" />
    </div>
  );
}

/** Lab hazard label. */
export function HazardLabel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn("flex w-72 items-stretch border-[3px] border-ink bg-paper shadow-brutal", className)}>
      <div className="grid w-20 shrink-0 place-items-center border-r-[3px] border-ink bg-sun">
        <svg viewBox="0 0 60 54" className="h-12 w-12" aria-hidden>
          <path d="M30 3 57 51H3Z" fill="#FFD84D" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="30" cy="40" r="3.2" fill="#171717" />
          <path d="M30 18v15" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="p-3">
        <p className="font-display text-sm font-extrabold uppercase tracking-wider">{title}</p>
        <p className="mt-1 font-mono text-[10px] leading-snug">{children}</p>
      </div>
    </div>
  );
}

/** Embossed label-maker tape. */
export function LabelTape({ children, color = "bg-ink text-paper", className, rotate = -2 }: { children: ReactNode; color?: string; className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block px-3 py-1 font-mono text-sm font-bold uppercase tracking-[0.25em] shadow-[2px_3px_0_rgba(0,0,0,.3)]", color, className)}
      style={{ transform: `rotate(${rotate}deg)`, textShadow: "0 1px 0 rgba(255,255,255,.25), 0 -1px 0 rgba(0,0,0,.4)" }}
    >
      {children}
    </span>
  );
}

/** "Wish you were here" postcard. */
export function Postcard({ to, message, className }: { to: string; message: string; className?: string }) {
  return (
    <div aria-hidden className={cn("relative grid border-[3px] border-ink bg-[#fbf5e8] shadow-brutal-lg sm:grid-cols-[1.2fr_1fr]", className)}>
      <div className="relative p-5 sm:border-r-2 sm:border-dashed sm:border-ink/40">
        <p className="font-serif text-3xl font-black italic leading-none">Wish you were here!</p>
        <p className="mt-4 font-hand text-2xl font-bold leading-snug text-electric">{message}</p>
        <StarSticker color="#FF755E" className="absolute -bottom-4 left-4 h-10 w-10 -rotate-12" />
      </div>
      <div className="relative p-5 pt-6">
        <PostageStamp value="30¢" label="first class" color="bg-electric" rotate={4} postmark={false} className="float-right -mt-2 ml-3 origin-top-right scale-75" />
        <p className="clear-right pt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">to</p>
        <div className="mt-1 space-y-3">
          {[to, "the internet", "planet earth ☺"].map((l) => (
            <p key={l} className="border-b-2 border-ink/40 pb-0.5 font-hand text-2xl font-bold leading-none">
              {l}
            </p>
          ))}
        </div>
      </div>
      <Washi pattern="dots" color="#9DDC8B" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
    </div>
  );
}
