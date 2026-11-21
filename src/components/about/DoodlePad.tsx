"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Pencil, Trash2 } from "lucide-react";
import { findEgg } from "@/lib/eggs";
import { cn } from "@/lib/utils";

const INKS = ["#171717", "#3E5C76", "#D2693A", "#2f8a3a"];

/** A little canvas in the margin. Visitors can leave a doodle (kept locally). */
export function DoodlePad() {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const distance = useRef(0);
  const [ink, setInk] = useState(INKS[0]);
  const [erase, setErase] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      const prev = c.toDataURL();
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
      try {
        img.src = sessionStorage.getItem("diary:doodle") ?? prev;
      } catch {
        img.src = prev;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    const l = last.current ?? p;
    ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    ctx.strokeStyle = ink;
    ctx.lineWidth = erase ? 22 : 3.2 + (e.pressure || 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    distance.current += Math.hypot(p.x - l.x, p.y - l.y);
    if (distance.current > 600) {
      distance.current = -Infinity;
      findEgg("doodle");
    }
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
    try {
      sessionStorage.setItem("diary:doodle", ref.current!.toDataURL());
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative border-[3px] border-ink bg-paper shadow-brutal">
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-cream px-2 py-1.5">
        <span className="mr-auto font-hand text-xl font-bold">leave a doodle →</span>
        {INKS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setInk(c);
              setErase(false);
            }}
            aria-label={`Pen colour ${c}`}
            aria-pressed={!erase && ink === c}
            className={cn("h-6 w-6 rounded-full border-2 border-ink transition-transform", !erase && ink === c && "scale-125")}
            style={{ background: c }}
          />
        ))}
        <button onClick={() => setErase((v) => !v)} aria-pressed={erase} aria-label="Eraser" className={cn("p-1", erase && "bg-sun")}>
          {erase ? <Eraser className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
        <button
          aria-label="Clear doodle"
          className="p-1"
          onClick={() => {
            const c = ref.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            try {
              sessionStorage.removeItem("diary:doodle");
            } catch {
              /* ignore */
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <canvas
        ref={ref}
        aria-label="Doodle canvas — draw with your mouse, pen or finger"
        role="img"
        className="grid-paper block h-64 w-full touch-none"
        style={{ cursor: erase ? "cell" : "crosshair" }}
        onPointerDown={(e) => {
          drawing.current = true;
          last.current = pos(e);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerCancel={end}
      />
    </div>
  );
}
