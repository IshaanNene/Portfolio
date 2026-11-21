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
    "I'm Ishaan — a software engineer out of PES University, now at IBM. I like building the whole system behind a product, not just its front door: Rust microservices, Go platforms, Kafka pipelines and the dashboards that watch them.",
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
    { src: "", caption: "the desk", date: "'26" },
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
    label: "[PLACEHOLDER] Open to new opportunities",
    building: "Meridian — a Jira-style tracker in Rust",
  },

  contact: {
    email: "you@example.com",
    /**
     * Optional: an endpoint that accepts a JSON POST {name,email,message}
     * (Formspree, a serverless function, …). When empty the form opens the
     * visitor's mail app with a pre-filled message instead.
     */
    formEndpoint: "",
    message:
      "[PLACEHOLDER] Thanks for reading this far. Whether it's a role, a collaboration or just a nerdy question — my inbox is open and I reply to every letter.",
  },

  socials: {
    github: "https://github.com/IshaanNene",
    linkedin: "https://www.linkedin.com/in/your-username",
  },

  /** Little facts that show up on the /about desk objects. */
  desk: {
    coffee: "[PLACEHOLDER] Your usual coffee order (or tea — no judgement).",
    headphones: "[PLACEHOLDER] What's on repeat while you code.",
    notebook: "[PLACEHOLDER] What you scribble in your notebook. Scroll down for the scribble page.",
    pens: "[PLACEHOLDER] Favourite tools for thinking on paper.",
    photo1: "[PLACEHOLDER] A place or person that matters to you.",
    photo2: "[PLACEHOLDER] A memory from a project, trip or hackathon.",
    plant: "[PLACEHOLDER] A hobby away from the keyboard.",
    laptop: "[PLACEHOLDER] Your setup — editor, OS, keyboard.",
  },

  interests: ["Distributed systems", "Chess (and chess engines)", "Guitar", "Albums, front to back"],
  personality: [
    { label: "[Trait]", note: "[PLACEHOLDER] a short sentence that shows it" },
    { label: "[Trait]", note: "[PLACEHOLDER] a short sentence that shows it" },
    { label: "[Trait]", note: "[PLACEHOLDER] a short sentence that shows it" },
  ],

  enjoyBuilding: [
    "[PLACEHOLDER] The kind of systems you love building",
    "[PLACEHOLDER] The kind of problems you love untangling",
    "[PLACEHOLDER] The kind of products you love shipping",
  ],
} as const;

export type Site = typeof site;

/** Quick check used by the UI to show "sample" stamps. */
export const isPlaceholder = (value: string) => value.includes("[");
