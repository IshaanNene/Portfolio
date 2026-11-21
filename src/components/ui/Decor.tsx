import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Strip of washi tape. Position with className/style. */
export function Tape({ className, style, color }: { className?: string; style?: CSSProperties; color?: string }) {
  return <span aria-hidden className={cn("tape", className)} style={{ ...(color ? { background: color } : {}), ...style }} />;
}

/** Pushpin for pinboards. */
export function Pin({ color = "#FF755E", className }: { color?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("absolute left-1/2 top-1 z-10 -translate-x-1/2", className)}>
      <span className="block h-4 w-4 rounded-full border-2 border-ink" style={{ background: color, boxShadow: "2px 3px 0 rgba(0,0,0,.35)" }} />
    </span>
  );
}

/** Paperclip SVG. */
export function PaperClip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 64" className={cn("h-16 w-6", className)} aria-hidden>
      <path
        d="M16 14 V48 a6 6 0 0 1 -12 0 V10 a4 4 0 0 1 8 0 V44 a2 2 0 0 1 -4 0 V16"
        fill="none"
        stroke="#7b7f86"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* metallic glint */}
      <path d="M16 14 V48 a6 6 0 0 1 -12 0 V10 a4 4 0 0 1 8 0 V44 a2 2 0 0 1 -4 0 V16" fill="none" stroke="#e9edf2" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="5 14 3 30" opacity="0.9" />
    </svg>
  );
}

/** Rubber stamp text block. */
export function RubberStamp({
  children,
  color = "#FF755E",
  className,
  rotate = -8,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={cn("inline-block border-[3px] px-3 py-1 font-display text-lg font-extrabold uppercase tracking-wider", className)}
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate}deg)`,
        maskImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.4 1.75'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    >
      {children}
    </span>
  );
}

/** Generated barcode from a string — deterministic. */
export function Barcode({ value, className }: { value: string; className?: string }) {
  const bars: number[] = [];
  for (let i = 0; i < value.length * 3; i++) {
    const c = value.charCodeAt(i % value.length) + i * 7;
    bars.push((c % 3) + 1, ((c >> 2) % 2) + 1);
  }
  let x = 0;
  const rects = bars.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="#171717" /> : null;
    x += w;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className={cn("h-12 w-full", className)} aria-label={`barcode ${value}`} role="img">
      {rects}
    </svg>
  );
}
