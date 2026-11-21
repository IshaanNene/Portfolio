/**
 * PASSPORT STAMPS — launches, hackathons, certifications & milestones.
 * All entries are PLACEHOLDERS — replace them with real ones.
 */

export type StampKind = "launch" | "hackathon" | "certification" | "milestone";

export type Stamp = {
  id: string;
  kind: StampKind;
  title: string;
  place: string;
  date: string;
  note: string;
};

export const stampKinds: Record<StampKind, { label: string; color: string; shape: "circle" | "rect" | "hex" | "oval" }> = {
  launch: { label: "Launch", color: "#477BFF", shape: "circle" },
  hackathon: { label: "Hackathon", color: "#FF755E", shape: "rect" },
  certification: { label: "Certified", color: "#2f8a3a", shape: "hex" },
  milestone: { label: "Milestone", color: "#171717", shape: "oval" },
};

export const stamps: Stamp[] = [
  { id: "s1", kind: "launch", title: "[Product launch]", place: "[Where]", date: "[MMM YYYY]", note: "[What launched and why it mattered]" },
  { id: "s2", kind: "hackathon", title: "[Hackathon name]", place: "[City]", date: "[MMM YYYY]", note: "[What you built in 48h]" },
  { id: "s3", kind: "certification", title: "[Certification]", place: "[Issuer]", date: "[YYYY]", note: "[What it covers]" },
  { id: "s4", kind: "milestone", title: "[Milestone]", place: "[Context]", date: "[YYYY]", note: "[Why it counts]" },
  { id: "s5", kind: "hackathon", title: "[Hackathon name]", place: "[Online]", date: "[MMM YYYY]", note: "[Result — only if real]" },
  { id: "s6", kind: "launch", title: "[Open-source release]", place: "[GitHub]", date: "[MMM YYYY]", note: "[v1.0 of something]" },
  { id: "s7", kind: "certification", title: "[Course / Cert]", place: "[Issuer]", date: "[YYYY]", note: "[Skill gained]" },
  { id: "s8", kind: "milestone", title: "[Talk / article]", place: "[Venue]", date: "[YYYY]", note: "[Topic]" },
];
