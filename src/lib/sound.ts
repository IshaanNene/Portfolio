"use client";

/**
 * Tiny synthesized sound effects (no audio files to download).
 * Off by default; toggled from the navigation. Respects the user's choice
 * across visits via localStorage.
 */
import { useSyncExternalStore } from "react";
import { safeStorage } from "./utils";

type SoundName = "tick" | "paper" | "thunk" | "stamp" | "key" | "pop" | "rip" | "open" | "glitch";

const KEY = "diary:sound";
let enabled = false;
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  enabled = safeStorage()?.getItem(KEY) === "on";
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  safeStorage()?.setItem(KEY, on ? "on" : "off");
  listeners.forEach((l) => l());
  if (on) play("pop");
}

export function useSoundEnabled() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => enabled,
    () => false,
  );
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBurst(a: AudioContext, duration: number, freq: number, gain: number, q = 1) {
  const len = Math.floor(a.sampleRate * duration);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.destination);
  src.start();
}

function tone(a: AudioContext, freq: number, duration: number, gain: number, type: OscillatorType = "sine", slideTo?: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + duration);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + duration);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + duration);
}

export function play(name: SoundName) {
  if (!enabled || typeof window === "undefined") return;
  const a = audio();
  if (!a) return;
  switch (name) {
    case "tick":
      tone(a, 1800, 0.03, 0.04, "square");
      break;
    case "key":
      noiseBurst(a, 0.03, 3200, 0.25, 2);
      break;
    case "paper":
      noiseBurst(a, 0.22, 2400, 0.35, 0.7);
      break;
    case "rip":
      noiseBurst(a, 0.45, 1800, 0.5, 0.5);
      break;
    case "thunk":
      tone(a, 160, 0.18, 0.25, "triangle", 60);
      noiseBurst(a, 0.06, 600, 0.3, 1);
      break;
    case "stamp":
      tone(a, 110, 0.12, 0.35, "square", 50);
      noiseBurst(a, 0.08, 900, 0.4, 1);
      break;
    case "pop":
      tone(a, 520, 0.12, 0.12, "sine", 980);
      break;
    case "open":
      // board creak + the first pages fanning
      tone(a, 120, 0.25, 0.12, "triangle", 70);
      noiseBurst(a, 0.35, 1600, 0.22, 0.6);
      break;
    case "glitch":
      tone(a, 880, 0.08, 0.05, "square", 220);
      setTimeout(() => tone(a, 440, 0.08, 0.05, "sawtooth", 1320), 90);
      setTimeout(() => noiseBurst(a, 0.12, 4000, 0.12, 3), 180);
      break;
  }
}

/** Beep for morse playback (independent of the global toggle — user-initiated). */
export function beep(duration: number, at = 0) {
  if (typeof window === "undefined") return;
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.frequency.value = 620;
  g.gain.setValueAtTime(0, a.currentTime + at);
  g.gain.linearRampToValueAtTime(0.12, a.currentTime + at + 0.005);
  g.gain.setValueAtTime(0.12, a.currentTime + at + duration);
  g.gain.linearRampToValueAtTime(0, a.currentTime + at + duration + 0.01);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + at);
  o.stop(a.currentTime + at + duration + 0.02);
}
