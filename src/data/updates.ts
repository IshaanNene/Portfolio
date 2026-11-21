/**
 * NOW — sticky notes + weekly log on /now.
 * PLACEHOLDER content — rewrite whenever your "now" changes.
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
  { id: "n1", kind: "building", title: "Currently building", body: "[PLACEHOLDER] The main thing on your workbench right now.", secret: "psst — this whole site counts too." },
  { id: "n2", kind: "learning", title: "Currently learning", body: "[PLACEHOLDER] A technology or concept you're studying.", secret: "the trick: build something tiny with it on day one." },
  { id: "n3", kind: "experiment", title: "Experiment", body: "[PLACEHOLDER] A weird idea you're prototyping.", secret: "it might not work. that's the fun part." },
  { id: "n4", kind: "reading", title: "Reading", body: "[PLACEHOLDER] A book, paper or blog series.", secret: "margin notes > highlights." },
  { id: "n5", kind: "update", title: "This week", body: "[PLACEHOLDER] One sentence about what changed this week.", secret: "you found a secret note! there are more." },
  { id: "n6", kind: "building", title: "Side quest", body: "[PLACEHOLDER] A small tool or script you're tinkering with.", secret: "try typing 'coffee' anywhere on this site." },
];

export type UpdateEntry = { date: string; text: string; tag: NoteKind };

export const weeklyUpdates: UpdateEntry[] = [
  { date: "[YYYY-MM-DD]", tag: "update", text: "[PLACEHOLDER] Most recent update." },
  { date: "[YYYY-MM-DD]", tag: "building", text: "[PLACEHOLDER] Shipped / started something." },
  { date: "[YYYY-MM-DD]", tag: "learning", text: "[PLACEHOLDER] Learned something worth writing down." },
  { date: "[YYYY-MM-DD]", tag: "experiment", text: "[PLACEHOLDER] Tried an experiment." },
];
