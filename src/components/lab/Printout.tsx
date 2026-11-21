import { Staple, TornPaper } from "@/components/scrapbook/pieces";
import { Washi } from "@/components/ui/Scrapbook";

const NOTES = [
  "terminal: input -> parse -> command table -> lines out",
  "commands live in lab/commands.ts (pure fns, no server)",
  "sorts are generators: one yield = one frame",
  "morse beeps are synthesised with WebAudio, no files",
  "everything here runs in your browser",
];

/** Tractor-feed dot-matrix printout of engineering notes. */
export function Printout() {
  return (
    <div className="relative mx-auto max-w-md rotate-[-1.2deg]">
      <Washi pattern="stripe" color="#3E5C76" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
      <div className="relative border-x-[3px] border-ink bg-[#f4f7ef] shadow-brutal-lg" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 28px, rgba(143,160,90,.35) 28px 56px)" }}>
        {/* sprocket holes */}
        {["left-1.5", "right-1.5"].map((side) => (
          <div key={side} className={`absolute inset-y-0 ${side} flex flex-col justify-around py-2`} aria-hidden>
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="h-3 w-3 rounded-full border-2 border-ink/50 bg-cream" />
            ))}
          </div>
        ))}
        <div className="border-t-[3px] border-dashed border-ink/40 px-9 py-6 font-mono text-[12px] leading-[28px] text-ink/85">
          <p className="font-bold tracking-[0.25em]">** ENGINEERING NOTES **</p>
          <p>-------------------------------</p>
          {NOTES.map((n, i) => (
            <p key={i}>
              {String(i + 1).padStart(2, "0")}. {n}
            </p>
          ))}
          <p>-------------------------------</p>
          <p className="font-hand text-xl font-bold text-coral">← keep adding to this list</p>
        </div>
        <div className="h-3 border-t-[3px] border-dashed border-ink/40" aria-hidden />
      </div>
    </div>
  );
}

/** Pencil sketch of how the terminal works, on torn graph paper. */
export function TerminalSketch() {
  const box = { fill: "none", stroke: "#2b2b2b", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <TornPaper seed={31} grid rotate={1.5} className="mx-auto max-w-md">
      <div className="relative p-6">
        <Staple className="absolute -top-0.5 left-10" rotate={-4} />
        <p className="font-hand text-2xl font-bold">sketch: how the terminal works</p>
        <svg viewBox="0 0 360 200" className="draw mt-3 w-full" role="img" aria-label="Diagram: you type, the parser splits it, the command table answers, lines are printed back">
          {/* boxes drawn slightly wobbly */}
          <path pathLength={1} {...box} d="M10 30 Q60 26 100 30 L98 72 Q55 76 12 72 Z" />
          <path pathLength={1} {...box} d="M135 28 Q180 24 225 30 L222 74 Q178 78 137 73 Z" />
          <path pathLength={1} {...box} d="M260 30 Q305 26 350 31 L348 72 Q300 77 262 71 Z" />
          <path pathLength={1} {...box} d="M135 130 Q180 126 225 131 L223 172 Q180 177 137 171 Z" />
          {/* arrows */}
          <path pathLength={1} {...box} d="M102 50 Q118 46 132 50 M124 43 L133 50 L124 57" />
          <path pathLength={1} {...box} d="M227 50 Q243 46 257 50 M249 43 L258 50 L249 57" />
          <path pathLength={1} {...box} d="M300 76 Q290 120 228 150 M240 140 L228 150 L242 156" />
          <path pathLength={1} {...box} d="M135 150 Q60 150 55 78 M48 90 L55 78 L62 90" />
          <g style={{ fontFamily: "var(--font-hand)" }} fontSize="19" fontWeight="700" fill="#171717" textAnchor="middle">
            <text x="55" y="57">you type</text>
            <text x="180" y="57">parse</text>
            <text x="305" y="57">commands</text>
            <text x="180" y="157">print lines</text>
          </g>
          <text x="60" y="120" style={{ fontFamily: "var(--font-hand)" }} fontSize="16" fill="#D2693A" transform="rotate(-8 60 120)">
            repeat ↺
          </text>
        </svg>
      </div>
    </TornPaper>
  );
}
