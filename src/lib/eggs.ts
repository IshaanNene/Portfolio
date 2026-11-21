"use client";

/**
 * Easter-egg registry. Each egg is found by an interaction somewhere on the
 * site; progress is kept in the visitor's browser and shown on the back page.
 */
import { useSyncExternalStore } from "react";
import { safeStorage } from "./utils";

export const EGGS = {
  konami: { name: "The Old Code", hint: "Some codes are older than the web. ↑↑…" },
  terminal: { name: "Root Access", hint: "Ask the Lab terminal nicely. Or not nicely." },
  sticker: { name: "Sticker Bomber", hint: "Peel a sticker off the sheet and stick it somewhere." },
  donotpress: { name: "Button Pusher", hint: "There's a sticker on the diary you should not press." },
  coffee: { name: "Caffeinated", hint: "Type the developer's favourite fuel. Anywhere." },
  doodle: { name: "Margin Artist", hint: "Leave a doodle on the scribble page." },
  clock: { name: "Time Traveller", hint: "Click the flip clock until time gets weird." },
  receipt: { name: "Tear Here", hint: "Every receipt has a dotted line." },
  classified: { name: "Clearance Granted", hint: "Some folders in the Lab are classified." },
  secretnote: { name: "Note Flipper", hint: "Sticky notes have two sides." },
  paperclip: { name: "Clip Collector", hint: "The paperclip at the bottom of every page is loose." },
  backpage: { name: "Back Page", hint: "You're reading it." },
} as const;

export type EggId = keyof typeof EGGS;

const KEY = "diary:eggs";
const listeners = new Set<() => void>();
let found: EggId[] = [];
let snapshot = "";

function load() {
  try {
    found = JSON.parse(safeStorage()?.getItem(KEY) ?? "[]");
  } catch {
    found = [];
  }
  snapshot = found.join(",");
}
if (typeof window !== "undefined") load();

export type EggEvent = { id: EggId; isNew: boolean };

export function findEgg(id: EggId) {
  const isNew = !found.includes(id);
  if (isNew) {
    found = [...found, id];
    snapshot = found.join(",");
    safeStorage()?.setItem(KEY, JSON.stringify(found));
    listeners.forEach((l) => l());
  }
  window.dispatchEvent(new CustomEvent<EggEvent>("diary:egg", { detail: { id, isNew } }));
}

export function resetEggs() {
  found = [];
  snapshot = "";
  safeStorage()?.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function useEggs(): EggId[] {
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => "",
  );
  return snap ? (snap.split(",") as EggId[]) : [];
}
