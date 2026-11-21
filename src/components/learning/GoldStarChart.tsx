"use client";

import { usePersistentState } from "@/hooks/usePersistentState";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { StarSticker } from "@/components/ui/Scrapbook";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ROWS = [
  { label: "read something", color: "#FFD84D" },
  { label: "built something", color: "#FF755E" },
  { label: "learnt something", color: "#9DDC8B" },
];

/** A primary-school sticker chart. Stars are kept in this browser. */
export function GoldStarChart() {
  const [stars, setStars] = usePersistentState<string[]>("diary:stars", []);
  const total = stars.length;

  return (
    <div className="relative border-[3px] border-ink bg-paper p-4 shadow-brutal-lg sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-2xl font-extrabold uppercase">Sticker chart</p>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          {total} / {DAYS.length * ROWS.length} stars this week
        </p>
      </div>
      <p className="mt-1 font-hand text-xl text-electric">award yourself one. nobody&rsquo;s checking.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[30rem] table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-40" />
              {DAYS.map((d, i) => (
                <th key={i} className="pb-1 font-mono text-xs font-bold">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, r) => (
              <tr key={row.label}>
                <th scope="row" className="border-[2px] border-ink bg-cream px-2 py-1 text-left font-hand text-lg font-bold">
                  {row.label}
                </th>
                {DAYS.map((_, c) => {
                  const id = `${r}-${c}`;
                  const on = stars.includes(id);
                  return (
                    <td key={id} className="border-[2px] border-ink p-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${row.label}, day ${c + 1}`}
                        onClick={() => {
                          play(on ? "tick" : "pop");
                          setStars((s) => (on ? s.filter((x) => x !== id) : [...s, id]));
                        }}
                        className={cn("grid h-11 w-full place-items-center transition-colors hover:bg-sun/30")}
                      >
                        {on && <StarSticker color={row.color} className="h-8 w-8" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total === DAYS.length * ROWS.length && (
        <p className="mt-3 font-display text-lg font-extrabold uppercase text-coral">full chart. gold star for the gold stars. ★</p>
      )}
    </div>
  );
}
