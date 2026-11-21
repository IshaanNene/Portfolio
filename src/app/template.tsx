"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Route transition: each page slides in like a fresh sheet of paper. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: -0.6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 210, damping: 26, mass: 0.8 }}
      style={{ transformOrigin: "50% 0%" }}
    >
      {children}
    </motion.div>
  );
}
