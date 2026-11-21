/**
 * SCRIBBLES — the handwritten page on /about.
 * SAMPLE thoughts so the page isn't blank. Replace with your own ideas,
 * observations and half-finished concepts.
 */

export type Scribble = {
  id: string;
  kind: "idea" | "thought" | "observation" | "unfinished";
  text: string;
  crossedOut?: string;
};

export const scribbles: Scribble[] = [
  { id: "c1", kind: "idea", text: "[SAMPLE idea] a tool that turns my commit history into a diary entry", crossedOut: "a blog" },
  { id: "c2", kind: "thought", text: "[SAMPLE thought] the best abstraction is the one you can delete later" },
  { id: "c3", kind: "observation", text: "[SAMPLE] every bug I've loved was a timezone bug" },
  { id: "c4", kind: "unfinished", text: "[SAMPLE] what if the cache was the database and the database was the…" },
  { id: "c5", kind: "idea", text: "[SAMPLE idea] tiny multiplayer whiteboard over WebRTC" },
  { id: "c6", kind: "thought", text: "[SAMPLE] readable > clever. (usually.)", crossedOut: "always" },
];
