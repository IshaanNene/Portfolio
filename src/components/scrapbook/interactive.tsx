"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { findEgg, type EggId } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { PaperClip } from "@/components/ui/Decor";
import { stickyColors } from "./pieces";

/* ───────── physics ───────── */

let topZ = 40;
const noSub = () => () => {};
/** true on mouse/trackpad devices; touch devices keep native scrolling instead of dragging. */
export function useFinePointer() {
  return useSyncExternalStore(noSub, () => window.matchMedia("(pointer: fine)").matches, () => true);
}
const raise = () => ++topZ;

/** Pushes an element a few px away from a passing cursor (fine pointers only). */
function useNudge(ref: RefObject<HTMLElement | null>, enabled: boolean, radius = 150, push = 7) {
  const nx = useSpring(0, { stiffness: 180, damping: 14 });
  const ny = useSpring(0, { stiffness: 180, damping: 14 });
  useEffect(() => {
    if (!enabled || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        const dx = b.left + b.width / 2 - e.clientX;
        const dy = b.top + b.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy);
        const reach = radius + Math.max(b.width, b.height) / 2;
        if (d > reach || d < 1) {
          nx.set(0);
          ny.set(0);
          return;
        }
        const f = (1 - d / reach) * push;
        nx.set((dx / d) * f);
        ny.set((dy / d) * f);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled, nx, ny, radius, push, ref]);
  return { nx, ny };
}

/**
 * Pick-up-able paper object: drag it, it tilts with velocity, lifts its
 * shadow while held and settles with a spring. Nearby cursors nudge it.
 */
export function Draggable({
  children,
  className,
  rotate = 0,
  bounds,
  label,
  nudge = true,
  onPick,
  style,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  bounds?: RefObject<HTMLElement | null>;
  label?: string;
  nudge?: boolean;
  onPick?: () => void;
  style?: React.CSSProperties;
}) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const swing = useSpring(useTransform(vx, [-1600, 1600], [-14, 14], { clamp: true }), { stiffness: 260, damping: 18 });
  const rot = useTransform(swing, (t) => rotate + (reduced ? 0 : t));
  const [held, setHeld] = useState(false);
  const [z, setZ] = useState<number | undefined>(undefined);
  const { nx, ny } = useNudge(ref, nudge && !reduced && !held);
  const fine = useFinePointer();

  return (
    <motion.div
      ref={ref}
      drag={fine}
      dragConstraints={bounds}
      dragElastic={0.1}
      dragMomentum={!reduced}
      dragTransition={{ power: 0.18, timeConstant: 160 }}
      onDragStart={() => {
        setHeld(true);
        setZ(raise());
        play("paper");
        onPick?.();
      }}
      onDragEnd={() => setHeld(false)}
      onPointerDown={() => setZ(raise())}
      style={{ x, y, rotate: rot, zIndex: z, ...style }}
      aria-label={label}
      className={cn(fine && "cursor-grab touch-none select-none active:cursor-grabbing", className)}
    >
      <motion.div style={{ x: nx, y: ny }}>
        <motion.div
          animate={{
            scale: held ? 1.06 : 1,
            filter: held ? "drop-shadow(12px 16px 0 rgba(23,23,23,.22))" : "drop-shadow(0px 0px 0 rgba(23,23,23,0))",
          }}
          whileHover={reduced || held ? undefined : { scale: 1.025, filter: "drop-shadow(5px 7px 0 rgba(23,23,23,.16))" }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Wrapper that lifts paper slightly on hover (no dragging). */
export function Liftable({ children, className, rotate = 0 }: { children: ReactNode; className?: string; rotate?: number }) {
  return (
    <motion.div
      className={className}
      initial={false}
      style={{ rotate }}
      whileHover={{ y: -5, rotate: rotate * 0.4, filter: "drop-shadow(6px 9px 0 rgba(23,23,23,.18))" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/* ───────── stickers ───────── */

const REACTIONS = ["hey!", "hehe", "boop", "★", "again?", "ok ok"];

/** A sticker that squishes and talks back when clicked. */
export function Sticker({
  children,
  className,
  label,
  egg,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  egg?: EggId;
}) {
  const [n, setN] = useState(0);
  const [talking, setTalking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        play("pop");
        setN((k) => k + 1);
        setTalking(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setTalking(false), 1300);
        if (egg && n + 1 >= 3) findEgg(egg);
      }}
      className={cn("relative block", className)}
    >
      <motion.span
        key={n}
        className="block"
        initial={n ? { scale: 1.25, rotate: -12 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 9 }}
      >
        {children}
      </motion.span>
      <AnimatePresence>
        {talking && n > 0 && (
          <motion.span
            key={n}
            initial={{ opacity: 0, y: 6, scale: 0.6 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap border-2 border-ink bg-paper px-1.5 font-hand text-lg font-bold leading-tight shadow-brutal-sm"
          >
            {REACTIONS[(n - 1) % REACTIONS.length]}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ───────── secret stamp ───────── */

/** Rubber stamp: click to thump it down and slide out the note hidden under it. */
export function SecretStamp({
  label,
  mark,
  secret,
  color = "#FF755E",
  className,
}: {
  label: string;
  mark: string;
  secret: ReactNode;
  color?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${label} stamp — reveals a note`}
        onClick={() => {
          setOpen((o) => !o);
          play("stamp");
          findEgg("stamp");
        }}
        className="group relative grid h-24 w-24 place-items-center rounded-full border-[3px] border-dashed text-center transition-transform hover:rotate-6"
        style={{ borderColor: color, color }}
      >
        <span className="font-display text-xs font-extrabold uppercase leading-tight tracking-widest">{label}</span>
        <span className="absolute -bottom-6 whitespace-nowrap font-hand text-base text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
          press me
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.span
              key="mark"
              className="animate-stamp pointer-events-none absolute -left-4 top-6 border-[3px] px-2 font-display text-lg font-extrabold uppercase tracking-widest"
              style={{ color, borderColor: color }}
            >
              {mark}
            </motion.span>
            <motion.div
              key="note"
              initial={{ opacity: 0, x: "-50%", y: -10, rotate: -6, scaleY: 0.4 }}
              animate={{ opacity: 1, x: "-50%", y: 8, rotate: 3, scaleY: 1 }}
              exit={{ opacity: 0, x: "-50%", y: -10, scaleY: 0.4 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={{ transformOrigin: "top" }}
              className="absolute left-1/2 top-full z-30 w-56 border-2 border-ink/70 bg-[#fffdf5] p-3 font-hand text-xl font-bold leading-snug shadow-brutal"
            >
              {secret}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── photos ───────── */

/**
 * Polaroid with a replaceable photo. Click it to turn it over and read the
 * note written on the back.
 */
export function PhotoCard({
  src,
  alt,
  caption,
  back,
  tint = "#9DDC8B",
  className,
  size = "md",
}: {
  src?: string;
  alt: string;
  caption: string;
  back?: ReactNode;
  tint?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [flipped, setFlipped] = useState(false);
  const w = { sm: "w-36", md: "w-48", lg: "w-60" }[size];
  const face = (
    <>
      <div className="relative aspect-square overflow-hidden border-2 border-ink" style={{ background: tint }}>
        {src ? (
          <Image src={src} alt={alt} fill sizes="240px" className="object-cover" unoptimized={src.endsWith(".svg")} />
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
            <circle cx="70" cy="28" r="12" fill="rgba(255,255,255,.75)" />
            <path d="M0 100 L0 70 L30 42 L52 64 L70 50 L100 78 L100 100Z" fill="rgba(23,23,23,.7)" />
          </svg>
        )}
      </div>
      <p className="mt-2 truncate font-hand text-xl font-bold leading-none">{caption}</p>
    </>
  );
  if (!back) return <div className={cn("bg-paper p-2.5 pb-3 shadow-[2px_3px_0_rgba(0,0,0,.18)]", w, className)}>{face}</div>;
  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={`Photo: ${alt}. Turn it over.`}
      onClick={() => {
        setFlipped((f) => !f);
        play("paper");
        if (!flipped) findEgg("photo");
      }}
      className={cn("relative block text-left [perspective:900px]", w, className)}
    >
      <span className="relative block transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped ? "rotateY(180deg)" : "none" }}>
        <span className="block bg-paper p-2.5 pb-3 shadow-[2px_3px_0_rgba(0,0,0,.18)] [backface-visibility:hidden]">{face}</span>
        <span className="absolute inset-0 flex flex-col justify-center bg-[#f6f1e6] p-4 shadow-[2px_3px_0_rgba(0,0,0,.18)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-soft">on the back:</span>
          <span className="mt-2 font-hand text-xl font-bold leading-snug text-electric">{back}</span>
        </span>
      </span>
    </button>
  );
}

/* ───────── hover annotation ───────── */

/** Shows a handwritten margin note when the wrapped object is hovered or focused. */
export function HoverNote({ children, note, side = "top", className }: { children: ReactNode; note: string; side?: "top" | "bottom" | "right"; className?: string }) {
  const [on, setOn] = useState(false);
  const pos = { top: "bottom-full left-1/2 mb-2 -translate-x-1/2", bottom: "top-full left-1/2 mt-2 -translate-x-1/2", right: "left-full top-1/2 ml-3 -translate-y-1/2" }[side];
  return (
    <span
      className={cn("relative inline-block", className)}
      onPointerEnter={() => setOn(true)}
      onPointerLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
    >
      {children}
      <AnimatePresence>
        {on && (
          <motion.span
            role="note"
            initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
            animate={{ opacity: 1, rotate: -2, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className={cn("pointer-events-none absolute z-40 w-max max-w-[14rem] font-hand text-xl font-bold leading-tight text-coral", pos)}
          >
            {note}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ───────── page corner ───────── */

const CORNER_NOTES: Record<string, string> = {
  "/": "you found the dog-ear. most people never fold the corners.",
  "/now/": "this page gets rewritten more than any other.",
  "/projects/": "the best projects started as 'just a quick hack'.",
  "/experience/": "every line on the receipt cost at least one late night.",
  "/about/": "secret: I still keep a paper notebook.",
  "/lab/": "try 'sudo' in the terminal. you didn't hear it from me.",
  "/stack/": "drawer E is empty. for now.",
  "/learning/": "tick a box. it's oddly satisfying.",
  "/contact/": "I always reply. eventually. promise.",
  "/music/": "turn it up. no, further.",
};

/** Folded page corner — tug it to turn it up and read what's written underneath. */
export function PageCorner() {
  const path = usePathname() ?? "/";
  const key = path.endsWith("/") ? path : path + "/";
  const [open, setOpen] = useState(false);
  const note = CORNER_NOTES[key] ?? "nothing written here. yet.";
  return (
    <div className="pointer-events-none relative mt-16 flex justify-end">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Turn up the page corner"
        onClick={() => {
          setOpen((o) => !o);
          play("paper");
          if (!open) findEgg("corner");
        }}
        className="group pointer-events-auto relative h-20 w-20"
      >
        <span
          className="absolute bottom-0 right-0 block bg-[#e6d6b8] shadow-[-4px_-4px_0_rgba(0,0,0,.12)] transition-all duration-300 ease-[var(--ease-paper)] group-hover:h-16 group-hover:w-16"
          style={{ height: open ? 76 : 44, width: open ? 76 : 44, clipPath: "polygon(0 0, 100% 0, 0 100%)", borderTop: "3px solid #171717", borderLeft: "3px solid #171717" }}
        />
        <span className="sr-only">{open ? note : "fold"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-2 right-24 max-w-xs -rotate-2 font-hand text-2xl font-bold leading-tight text-electric"
            aria-hidden
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── movable paperclip & sticky ───────── */

/** A loose paperclip you can slide around inside its parent. */
export function LooseClip({ bounds, className, rotate = 12 }: { bounds?: RefObject<HTMLElement | null>; className?: string; rotate?: number }) {
  return (
    <Draggable bounds={bounds} rotate={rotate} className={cn("absolute", className)} label="paperclip" nudge={false}>
      <PaperClip className="h-20 w-8" />
    </Draggable>
  );
}

/** Movable sticky note. */
export function DragSticky({
  children,
  color = "yellow",
  rotate = 0,
  bounds,
  className,
}: {
  children: ReactNode;
  color?: keyof typeof stickyColors;
  rotate?: number;
  bounds?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  return (
    <Draggable bounds={bounds} rotate={rotate} className={className}>
      <div className="relative w-40 p-3 pb-5 font-hand text-xl font-bold leading-tight" style={{ background: stickyColors[color], clipPath: "polygon(0 0,100% 0,100% 86%,86% 100%,0 100%)" }}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-4 bg-black/[.05]" />
        {children}
        <span aria-hidden className="absolute bottom-0 right-0 h-[14%] w-[14%] bg-black/15" style={{ clipPath: "polygon(0 0,100% 0,0 100%)" }} />
      </div>
    </Draggable>
  );
}
