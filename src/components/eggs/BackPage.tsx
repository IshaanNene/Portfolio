"use client";

import { useEffect, useState } from "react";
import { EGGS, findEgg, resetEggs, useEggs, type EggId } from "@/lib/eggs";
import { cn } from "@/lib/utils";
import { PaperCard } from "@/components/diary/PaperCard";

const SECRET = "the best code is the code you were curious enough to write";
const shift = (s: string, n: number) =>
  s.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + n + 26) % 26) + 97));

/** The hidden back page: egg checklist, a cipher to crack, secret notes. */
export function BackPage() {
  const found = useEggs();
  const [key, setKey] = useState(0);
  const all = Object.keys(EGGS) as EggId[];

  useEffect(() => {
    findEgg("backpage");
  }, []);

  const cipher = shift(SECRET, 7);
  const attempt = shift(cipher, -key);
  const solved = attempt === SECRET;

  return (
    <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <section aria-labelledby="eggs">
        <h2 id="eggs" className="font-display text-3xl font-extrabold uppercase">
          Easter eggs · {found.length}/{all.length}
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {all.map((id) => {
            const got = found.includes(id);
            return (
              <li key={id} className={cn("border-[3px] border-ink p-3 shadow-brutal-sm", got ? "bg-sun" : "bg-paper/60")}>
                <p className="font-display text-sm font-extrabold uppercase">{got ? `★ ${EGGS[id].name}` : "☆ ???"}</p>
                <p className="font-hand text-lg leading-tight">{EGGS[id].hint}</p>
              </li>
            );
          })}
        </ul>
        <button onClick={resetEggs} className="mt-4 font-mono text-[11px] uppercase underline decoration-dotted underline-offset-4">
          forget everything I found
        </button>
      </section>

      <section aria-labelledby="cipher" className="space-y-10">
        <PaperCard rotate={1.5}>
          <h2 id="cipher" className="font-display text-xl font-extrabold uppercase">A note in code</h2>
          <p className="mt-2 break-words font-mono text-sm">{cipher}</p>
          <label htmlFor="shift" className="mt-4 block font-hand text-xl font-bold">
            turn the decoder ring: {key}
          </label>
          <input id="shift" type="range" min={0} max={25} value={key} onChange={(e) => setKey(Number(e.target.value))} className="w-full accent-[#477BFF]" />
          <p className={cn("mt-3 break-words font-hand text-2xl font-bold leading-tight", solved ? "text-[#2f8a3a]" : "text-ink-soft")} aria-live="polite">
            {attempt}
          </p>
          {solved && <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">decoded. you&rsquo;d make a good debugger.</p>}
        </PaperCard>

        <PaperCard rotate={-2} className="bg-[#fff4b8]">
          <p className="font-hand text-2xl font-bold leading-tight">
            secret note: this whole diary — the pages, the cover, the desk — is drawn with code at runtime. no images were harmed (except the photo).
          </p>
        </PaperCard>
      </section>
    </div>
  );
}
