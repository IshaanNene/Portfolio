"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { play } from "@/lib/sound";

/** Last route rendered, so the next one knows which way the "page" should turn. */
let lastPath: string | null = null;

const depth = (p: string) => p.split("/").filter(Boolean).length;

function direction(from: string | null, to: string) {
  if (from === null || from === to) return "first";
  if (to === "/" || to === "") return "cover"; // closing back to the diary cover
  if (depth(to) > depth(from)) return "deeper"; // e.g. /projects → /projects/meridian
  if (depth(to) < depth(from)) return "back";
  return "sibling"; // chapter to chapter
}

const VARIANTS = {
  first: { opacity: 0, y: 28, rotate: -0.6 },
  cover: { opacity: 0, y: -24, scale: 0.985 },
  deeper: { opacity: 0, x: 60, rotateY: -8 },
  back: { opacity: 0, x: -60, rotateY: 8 },
  sibling: { opacity: 0, x: 36, rotate: 0.8 },
} as const;

/**
 * Route transition: every page is another sheet of the same scrapbook.
 * Going deeper turns a page forward, going back turns it the other way,
 * and the cover drops back onto the desk.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const dir = direction(lastPath, pathname);

  useEffect(() => {
    if (lastPath !== null && lastPath !== pathname) play("paper");
    lastPath = pathname;
  }, [pathname]);

  return (
    <div style={{ perspective: 1600 }}>
      <motion.div
        initial={reduced ? { opacity: 0 } : VARIANTS[dir]}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 0, rotateY: 0, scale: 1 }}
        transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 210, damping: 26, mass: 0.8 }}
        style={{ transformOrigin: dir === "back" ? "100% 0%" : dir === "deeper" || dir === "sibling" ? "0% 0%" : "50% 0%" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
