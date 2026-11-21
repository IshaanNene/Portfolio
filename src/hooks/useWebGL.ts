"use client";

import { useEffect, useState } from "react";

export type GPUTier = "none" | "low" | "high";

/**
 * Detects WebGL support plus a rough capability tier so 3D scenes can
 * simplify themselves on phones / weak GPUs. Returns null until measured
 * (first client render) so SSR always renders the fallback.
 */
export function useWebGL(): GPUTier | null {
  const [tier, setTier] = useState<GPUTier | null>(null);
  useEffect(() => {
    let result: GPUTier = "none";
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const small = Math.min(window.innerWidth, window.innerHeight) < 700;
        const cores = navigator.hardwareConcurrency ?? 4;
        const touch = window.matchMedia("(pointer: coarse)").matches;
        result = small || touch || cores <= 4 ? "low" : "high";
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    } catch {
      result = "none";
    }
    if (new URLSearchParams(window.location.search).has("no3d")) result = "none";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off capability probe after mount
    setTier(result);
  }, []);
  return tier;
}
