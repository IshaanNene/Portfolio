import { navItems } from "@/config/nav";
import { site } from "@/config/site";
import { projects } from "./projects";
import { drawers } from "./skills";
import { learningItems } from "./learning";

/**
 * What's printed on each page of the 3D diary on the home page.
 * Pages are generated from the rest of the site data, so they stay in sync.
 */

export type Doodle = "sticky" | "polaroid" | "receipt" | "desk" | "terminal" | "cabinet" | "checklist" | "envelope" | "record";

export type PageFace =
  | { kind: "inside-cover" }
  | { kind: "contents" }
  | { kind: "chapter"; href: string; page: string; title: string; color: string; blurb: string; lines: string[]; doodle: Doodle }
  | { kind: "hint" }
  | { kind: "notes" };

const palette: Record<string, string> = {
  sun: "#FFD84D",
  electric: "#477BFF",
  coral: "#FF755E",
  grass: "#9DDC8B",
  paper: "#FFFFFF",
  cream: "#F5EBD8",
  pink: "#FFB3C7",
};

const chapter = (href: string, doodle: Doodle, lines: string[]): PageFace => {
  const n = navItems.find((x) => x.href === href)!;
  return { kind: "chapter", href, page: n.page, title: n.label, color: palette[n.color], blurb: n.blurb, lines, doodle };
};

const strip = (s: string) => s.replace(/\[|\]|PLACEHOLDER|SAMPLE|Sample/g, "").replace(/\s+/g, " ").trim();

export const diaryPages: { front: PageFace; back: PageFace }[] = [
  { front: { kind: "contents" }, back: chapter("/now", "sticky", ["currently building:", strip(site.status.building) || "something new", "flip clock · sticky notes"]) },
  { front: chapter("/projects", "polaroid", projects.slice(0, 3).map((p) => "• " + strip(p.name))), back: chapter("/experience", "receipt", ["printed on a very long receipt", "+ passport of milestones"]) },
  { front: chapter("/about", "desk", ["a desk you can poke around", "+ the scribble page"]), back: chapter("/lab", "terminal", ["$ help", "a real terminal + experiments", "(some folders are classified)"]) },
  { front: chapter("/stack", "cabinet", drawers.slice(0, 4).map((d) => "drawer " + d.code + " — " + d.label)), back: chapter("/learning", "checklist", learningItems.slice(0, 3).map((l, i) => (i === 0 ? "[x] " : "[ ] ") + "goal #" + (i + 1))) },
  { front: chapter("/contact", "envelope", ["sealed with wax.", "break it to say hi."]), back: chapter("/music", "record", ["on the turntable right now", "+ favourite records", "+ the guitar corner"]) },
  { front: { kind: "hint" }, back: { kind: "notes" } },
];

export type ChapterTab = { href: string; page: string; title: string; color: string; spread: number; side: "left" | "right" };

/** Index flags stuck to the diary's fore-edge — one per chapter, in reading order. */
export const chapterTabs: ChapterTab[] = diaryPages.flatMap((p, i) => {
  const out: ChapterTab[] = [];
  if (p.front.kind === "chapter") out.push({ ...pick(p.front), spread: i + 1, side: "right" });
  if (p.back.kind === "chapter") out.push({ ...pick(p.back), spread: i + 2, side: "left" });
  return out;
});
function pick(c: Extract<PageFace, { kind: "chapter" }>) {
  return { href: c.href, page: c.page, title: c.title, color: c.color };
}

export const diaryBlockTop: PageFace = { kind: "notes" };
export const diaryInsideCover: PageFace = { kind: "inside-cover" };

/** Spread k (k ≥ 1) → [left, right]. k = 0 is the closed cover. */
export function spreadFaces(k: number): [PageFace, PageFace] {
  const left = k === 1 ? diaryInsideCover : diaryPages[k - 2].back;
  const right = k - 1 < diaryPages.length ? diaryPages[k - 1].front : diaryBlockTop;
  return [left, right];
}

export const SPREAD_COUNT = diaryPages.length + 2; // closed + n+1 open spreads

export function faceLink(face: PageFace): { href: string; label: string } | null {
  if (face.kind === "chapter") return { href: face.href, label: face.title };
  if (face.kind === "inside-cover") return { href: "/contact", label: "Contact" };
  if (face.kind === "hint") return null;
  return null;
}
