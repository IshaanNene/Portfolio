"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { findEgg } from "@/lib/eggs";
import { play } from "@/lib/sound";
import { StickerArt, stickerKinds, stickerLabel, type StickerKind } from "./stickers";

/* ── tiny store for the sheet's open state (shared with the nav button) ── */
let sheetOpen = false;
const subs = new Set<() => void>();
const setSheet = (v: boolean) => {
  sheetOpen = v;
  subs.forEach((s) => s());
};
export function useStickerSheet() {
  const open = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => sheetOpen,
    () => false,
  );
  return { open, toggle: () => setSheet(!sheetOpen), close: () => setSheet(false) };
}

type Placed = { id: string; kind: StickerKind; x: number; y: number; r: number };

const storeKey = (path: string) => `diary:stickers:${path}`;
const rand = () => Math.random();

/**
 * Global sticker layer: peel stickers from the sheet and drop them anywhere
 * on the page. They stay put for the session (per page). Double-click or
 * press Delete on a focused sticker to peel it off again.
 */
export function StickerLayer() {
  const pathname = usePathname();
  const { open, close } = useStickerSheet();
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const placedRef = useRef(placed);
  useEffect(() => {
    placedRef.current = placed;
  }, [placed]);

  // load per-page stickers
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storeKey(pathname));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from session storage on route change
      setPlaced(raw ? JSON.parse(raw) : []);
    } catch {
      setPlaced([]);
    }
  }, [pathname]);

  const persist = useCallback(
    (list: Placed[]) => {
      try {
        sessionStorage.setItem(storeKey(pathname), JSON.stringify(list));
      } catch {
        /* ignore */
      }
    },
    [pathname],
  );

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setPlaced((list) => list.map((p) => (p.id === drag.id ? { ...p, x: e.pageX - drag.dx, y: e.pageY - drag.dy } : p)));
    };
    const up = () => {
      setDrag(null);
      play("pop");
      persist(placedRef.current);
      findEgg("sticker");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, persist]);

  const peel = (kind: StickerKind, e: React.PointerEvent) => {
    e.preventDefault();
    const id = rand().toString(36).slice(2);
    const r = Math.round((rand() * 2 - 1) * 18);
    setPlaced((l) => [...l, { id, kind, x: e.pageX - 32, y: e.pageY - 32, r }]);
    setDrag({ id, dx: 32, dy: 32 });
    play("paper");
  };

  const addCentered = (kind: StickerKind) => {
    const id = rand().toString(36).slice(2);
    const next = [
      ...placedRef.current,
      { id, kind, x: window.scrollX + window.innerWidth / 2 - 32 + (rand() * 80 - 40), y: window.scrollY + window.innerHeight / 3, r: Math.round(rand() * 30 - 15) },
    ];
    setPlaced(next);
    persist(next);
    findEgg("sticker");
    play("pop");
  };

  const remove = (id: string) => {
    const next = placedRef.current.filter((p) => p.id !== id);
    setPlaced(next);
    persist(next);
    play("rip");
  };

  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 z-[45] h-0 w-full" aria-label="Stickers you placed">
        {placed.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={`${stickerLabel(p.kind)} — double-click or press Delete to peel off`}
            className="pointer-events-auto absolute touch-none select-none"
            style={{ left: p.x, top: p.y, transform: `rotate(${p.r}deg) scale(${drag?.id === p.id ? 1.15 : 1})`, cursor: drag?.id === p.id ? "grabbing" : "grab", transition: "transform .15s" }}
            onPointerDown={(e) => {
              e.preventDefault();
              setDrag({ id: p.id, dx: e.pageX - p.x, dy: e.pageY - p.y });
            }}
            onDoubleClick={() => remove(p.id)}
            onKeyDown={(e) => (e.key === "Delete" || e.key === "Backspace") && remove(p.id)}
          >
            <StickerArt kind={p.kind} />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.aside
            aria-label="Sticker sheet"
            initial={{ y: -20, opacity: 0, rotate: -4 }}
            animate={{ y: 0, opacity: 1, rotate: -1.5 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed left-3 top-16 z-50 w-[min(19rem,calc(100vw-1.5rem))] border-[3px] border-ink bg-paper p-3 shadow-brutal-lg sm:left-5 sm:top-20"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-hand text-2xl font-bold leading-none">drag a sticker out!</p>
              <button onClick={close} aria-label="Close sticker sheet" className="brutal-sm bg-cream p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 rounded-sm bg-cream-deep/60 p-2" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.04) 8px 9px)" }}>
              {stickerKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="grid h-16 touch-none place-items-center transition-transform hover:-rotate-6 hover:scale-110"
                  onPointerDown={(e) => peel(k, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      addCentered(k);
                    }
                  }}
                  aria-label={`Peel ${stickerLabel(k)} (Enter places it on the page)`}
                >
                  <StickerArt kind={k} size={48} />
                </button>
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-soft">double-click a placed sticker to peel it off</p>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
