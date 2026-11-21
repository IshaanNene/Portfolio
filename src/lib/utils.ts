export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Deterministic pseudo-random tilt so SSR and client agree. */
export function tilt(seed: number | string, max = 3) {
  const n = typeof seed === "number" ? seed : [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return ((x - Math.floor(x)) * 2 - 1) * max;
}

export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const isBrowser = typeof window !== "undefined";

export function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
