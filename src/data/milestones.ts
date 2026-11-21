/**
 * PASSPORT STAMPS — launches, hackathons, certifications & milestones.
 * From my resume.
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
  { id: "s1", kind: "hackathon", title: "Kaggle Data Analytics Hackathon", place: "PES University", date: "Nov 2024", note: "Second place — forecasting dynamic pricing on multi-year, multi-category time series." },
  { id: "s2", kind: "milestone", title: "Joined IBM", place: "Bengaluru", date: "Jan 2026", note: "Software engineering intern on IBM Z tooling; full-time from June." },
  { id: "s3", kind: "certification", title: "Terraform on IBM Cloud", place: "IBM", date: "2026", note: "Infrastructure as code on IBM Cloud." },
  { id: "s4", kind: "milestone", title: "Graduated", place: "PES University", date: "Jun 2026", note: "B.Tech CSE, GPA 8.77, with CNR (2×) and DAC (4×) scholarships." },
  { id: "s5", kind: "launch", title: "ScrapeGoat, open source", place: "GitHub", date: "2026", note: "Apache-2.0 crawler and MCP server: 541 tests, 16 merged pull requests." },
  { id: "s6", kind: "certification", title: "Introduction to IBM z/OS", place: "IBM", date: "2026", note: "Plus z/OS Commands and Panels on IBM Z." },
  { id: "s7", kind: "launch", title: "Meridian product site", place: "GitHub Pages", date: "Nov 2026", note: "Twelve Rust services; phases 0–7 built and verified." },
  { id: "s8", kind: "certification", title: "Generative & Agentic AI Foundation", place: "IBM", date: "2026", note: "Alongside Cloud Essentials and Big Data Foundations." },
];
