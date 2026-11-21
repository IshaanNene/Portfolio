/**
 * NOW — sticky notes + weekly log on /now.
 * Rewrite whenever my "now" changes.
 */

export type NoteKind = "building" | "learning" | "experiment" | "update" | "reading";

export type StickyNoteData = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  /** Revealed when the visitor double-clicks/taps the note. */
  secret?: string;
};

export const noteColor: Record<NoteKind, string> = {
  building: "#FFD84D",
  learning: "#9DDC8B",
  experiment: "#FF755E",
  update: "#FFFFFF",
  reading: "#a9c3ff",
};

export const stickyNotes: StickyNoteData[] = [
  { id: "n1", kind: "building", title: "Currently building", body: "Meridian — a Jira-style tracker on twelve Rust services. Phases 0–7 done; next is a real cloud cluster.", secret: "psst — this whole site counts too." },
  { id: "n2", kind: "learning", title: "Currently learning", body: "The mainframe, from the inside: z/OS, JZOS, EBCDIC, and how decades-old programs get migrated in waves.", secret: "the trick: build something tiny with it on day one." },
  { id: "n3", kind: "experiment", title: "Experiment", body: "TracePoint — load the app, the database and the cache at once, on one clock, and let it say which tier is slow.", secret: "it says plainly that correlation is not proof." },
  { id: "n4", kind: "reading", title: "Just written", body: "“DebugAssist: evidence before fixes” — what the evaluation shows, and what it doesn't.", secret: "margin notes > highlights." },
  { id: "n5", kind: "update", title: "This week", body: "Turned this portfolio into a diary you can open, flip and poke at.", secret: "you found a secret note! there are more." },
  { id: "n6", kind: "building", title: "Side quest", body: "kaas — a CLI and terminal UI for any Kafka cluster, from one fast binary.", secret: "try typing 'coffee' anywhere on this site." },
];

export type UpdateEntry = { date: string; text: string; tag: NoteKind };

export const weeklyUpdates: UpdateEntry[] = [
  { date: "2026-11-21", tag: "update", text: "This site became an interactive diary." },
  { date: "2026-11-19", tag: "building", text: "Load-tested Meridian on one laptop: 1,000 reads/s at 7 ms p50, and every Kafka event delivered after a write burst." },
  { date: "2026-11-08", tag: "learning", text: "DebugAssist evaluation: root cause right or close in 80% of runs, at a median $0.014 a run — on synthetic bugs, caveats written down." },
  { date: "2026-09-07", tag: "experiment", text: "Wrote up how ScrapeGoat finds listings by page structure instead of selectors." },
];
