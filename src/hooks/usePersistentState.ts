"use client";

import { useCallback, useEffect, useState } from "react";
import { safeStorage } from "@/lib/utils";

/** useState that mirrors to localStorage after hydration (SSR-safe). */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = safeStorage()?.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          safeStorage()?.setItem(key, JSON.stringify(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key],
  );

  return [value, update, ready] as const;
}
