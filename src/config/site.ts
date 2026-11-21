/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIG — the one file to edit with your real details.
 * ─────────────────────────────────────────────────────────────
 *  Anything wrapped in [square brackets] is a PLACEHOLDER.
 *  Search the repo for "[" + "PLACEHOLDER" to find every one.
 *
 *  Content collections live next door in /src/data:
 *    projects.ts · experience.ts · skills.ts · updates.ts
 *    learning.ts · milestones.ts · scribbles.ts · lab.ts
 */

export const site = {
  /** Taken from the previous version of this repo — change freely. */
  name: "Ishaan Nene",
  firstName: "Ishaan",
  initials: "IN",
  role: "Software Engineer",
  /** One-liner used on the diary cover & SEO description. */
  tagline: "Builds the whole system behind the product — then writes it down.",
  /** Short handwritten intro on the cover (keep it under ~110 chars). */
  coverNote: "hi! I write code, break things on purpose & keep notes about all of it.",
  /** Longer intro paragraphs for /about. */
  intro: [
    "I'm Ishaan — a Software Development Engineer at IBM in Bengaluru, working on developer tooling and mainframe modernisation for IBM Z. I graduated from PES University in 2026. I like building the whole system behind a product, not just its front door: Rust microservices, Go platforms, Kafka pipelines and the dashboards that watch them.",
    "My GitHub bio says I'm a true engineer because I vent IRL. Away from the keyboard it's chess (I keep building engines for it), guitar, and albums played front to back — Tool, MF DOOM, Kendrick.",
  ],  /** Replace with /images/your-photo.jpg (portrait, ~800×1000). Keep the basePath prefix. */
  photo: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ishaan.webp`,
  photoAlt: "Ishaan Nene in a graduation cap and gown, arms crossed, in front of a brick wall",
  /** Handwritten date next to the cover photo. */
  photoDate: "grad day",
  /**
   * Photos lying on the home-page desk, around and under the diary.
   * Put a jpg in public/images/desk/ and set src, e.g. `${base}/images/desk/workspace.jpg`.
   * Empty src = painted placeholder.
   */
  deskPhotos: [
    { src: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ishaan.webp`, caption: "grad day!", date: "'25" },
    { src: "", caption: "first commit", date: "'26" },
    { src: "", caption: "me + guitar", date: "'26" },
  ] as { src: string; caption: string; date: string }[],
  location: "Bengaluru, India",
  /** IANA timezone used by the flip clock on /now. */
  timezone: "Asia/Kolkata",
  /** Public URL of the deployed site (used for SEO + sitemap). */
  url: "https://ishaannene.github.io/Portfolio",

  status: {
    available: true,
    label: "SDE @ IBM · Bengaluru",
    building: "Meridian — a Jira-style tracker in Rust",
  },

  contact: {
    email: "ishaannene@gmail.com",
    /**
     * Optional: an endpoint that accepts a JSON POST {name,email,message}
     * (Formspree, a serverless function, …). When empty the form opens the
     * visitor's mail app with a pre-filled message instead.
     */
    formEndpoint: "",
    message:
      "Thanks for reading this far. Whether it's a role, a collaboration or a nerdy question about Raft or Kafka — my inbox is open.",
  },

  socials: {
    github: "https://github.com/IshaanNene",
    linkedin: "https://www.linkedin.com/in/ishaan-nene-517247256",
    leetcode: "https://leetcode.com/u/ishaannene/",
    hackerrank: "https://www.hackerrank.com/profile/ishaannene",
    kaggle: "https://www.kaggle.com/ishaannene28028",
  },

  /** Little facts that show up on the /about desk objects. */
  desk: {
    coffee: "whatever keeps a 2–5 minute local CI run feeling long.",
    headphones: "albums, front to back — Tool, Madvillain, Kendrick.",
    notebook: "architecture sketches before code. Scroll down for the scribble page.",
    pens: "decision records: five ADRs for the chess platform alone.",
    photo1: "PES University, Bengaluru — B.Tech CSE, 2022–2026.",
    photo2: "second place at the Kaggle Data Analytics Hackathon, Nov 2024.",
    plant: "guitar. My GitHub README calls me one of the best guitarists in college.",
    laptop: "a Mac, a terminal, and Go, Rust or C/C++ most days. z/OS at work.",
  },

  interests: ["Distributed systems", "Chess (and chess engines)", "Guitar", "Albums, front to back"],
  personality: [
    { label: "Production from the first commit", note: "Tenancy, events and operations are designed in, not bolted on after the demo." },
    { label: "Measured, not claimed", note: "Numbers come from a test anyone can rerun, with the caveats next to them." },
    { label: "Evidence before fixes", note: "A root cause cites its evidence; a fix ships with a test that failed before it." },
  ],

  enjoyBuilding: [
    "Distributed back-ends — consensus, event buses, multi-tenant services",
    "Bugs that only appear under concurrency (Chronoscope found eighteen)",
    "Developer tooling that hands engineers their time back",
  ],
} as const;

export type Site = typeof site;

/** Quick check used by the UI to show "sample" stamps. */
export const isPlaceholder = (value: string) => value.includes("[");
