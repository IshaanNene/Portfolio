/**
 * LEARNING — the to-do notebook at /learning.
 * SAMPLE goals — replace with your own. `done` is the default state;
 * visitors can tick boxes and it's remembered in their browser only.
 */

export type LearningGroup = "completed" | "exploring" | "future";

export type LearningItem = {
  id: string;
  group: LearningGroup;
  title: string;
  note: string;
  done: boolean;
  resource?: { label: string; href: string };
};

export const groupMeta: Record<LearningGroup, { label: string; scrawl: string }> = {
  completed: { label: "Done & dusted", scrawl: "proof I finish things" },
  exploring: { label: "Exploring now", scrawl: "currently on the desk" },
  future: { label: "Someday / maybe", scrawl: "the wishlist" },
};

export const learningItems: LearningItem[] = [
  { id: "l1", group: "completed", title: "[SAMPLE] A course or book you finished", note: "[What it unlocked for you]", done: true },
  { id: "l2", group: "completed", title: "[SAMPLE] A technology you picked up", note: "[Where you used it]", done: true },
  { id: "l3", group: "completed", title: "[SAMPLE] A concept that finally clicked", note: "[How it clicked]", done: true },
  { id: "l4", group: "exploring", title: "[SAMPLE] Something you're studying", note: "[Why now]", done: false },
  { id: "l5", group: "exploring", title: "[SAMPLE] A tool you're evaluating", note: "[What you're testing]", done: false },
  { id: "l6", group: "exploring", title: "[SAMPLE] A paper you're reading", note: "[First impressions]", done: false },
  { id: "l7", group: "future", title: "[SAMPLE] A language on the wishlist", note: "[What you'd build]", done: false },
  { id: "l8", group: "future", title: "[SAMPLE] A field you want to dig into", note: "[Why it interests you]", done: false },
  { id: "l9", group: "future", title: "[SAMPLE] A big project idea", note: "[The first step]", done: false },
];
