/**
 * SCRIBBLES — the handwritten page on /about.
 * Lines lifted from my own notes and write-ups.
 */

export type Scribble = {
  id: string;
  kind: "idea" | "thought" | "observation" | "unfinished";
  text: string;
  crossedOut?: string;
};

export const scribbles: Scribble[] = [
  { id: "c1", kind: "idea", text: "a crawler that is a CLI, a library and an MCP server — in one binary", crossedOut: "three binaries" },
  { id: "c2", kind: "thought", text: "measured, not claimed." },
  { id: "c3", kind: "observation", text: "the query engines saturated before the services did" },
  { id: "c4", kind: "unfinished", text: "if one seed can break Raft eighteen ways, what does it do to…" },
  { id: "c5", kind: "idea", text: "run the CI checks before the push", crossedOut: "wait 20 minutes" },
  { id: "c6", kind: "thought", text: "evidence before fixes.", crossedOut: "vibes" },
];
