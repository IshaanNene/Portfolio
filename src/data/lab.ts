/**
 * LAB — ideas & prototypes cards on /lab.
 */

export const labIdeas = [
  { id: "i1", title: "Faultline", body: "Agentic root-cause investigation for Kubernetes: an alert in, a verified and cited RCA out, and any fix waits for a human. One thin path runs end to end.", status: "prototyping" },
  { id: "i2", title: "TracePoint", body: "When an app slows under load, was it the app, the database or the cache? Drive all three on one clock and let the evidence decide.", status: "prototyping" },
  { id: "i3", title: "Deterministic simulation", body: "One thread, one seed, a virtual clock, network and disk. Chronoscope found 18 real Raft and storage bugs this way.", status: "reading" },
] as const;

/** Revealed once the "classified" folder is unlocked. */
export const classified = [
  "kaas is the first of three products on one cluster-state engine. The other two already run.",
  "Some commits in miniride-client add bugs on purpose, so DebugAssist has something to catch.",
  "Easter egg: the diary has a back page. Konami knows the way.",
];
