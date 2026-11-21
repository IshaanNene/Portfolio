/**
 * PROJECTS — add a new object to `projects` and it automatically gets:
 *   • a Polaroid on /projects
 *   • a case-file page at /projects/<slug>
 *   • a newspaper clipping (when `featured: true`)
 *   • a diary + terminal mention
 *
 * Everything below marked `sample: true` is SAMPLE CONTENT — replace it.
 */

export type ProjectStatus = "shipped" | "in-progress" | "prototype" | "archived";

export type Project = {
  slug: string;
  name: string;
  /** One sentence for the Polaroid. */
  summary: string;
  /** Headline used on the newspaper clipping. */
  headline: string;
  year: string;
  role: string;
  status: ProjectStatus;
  featured?: boolean;
  sample?: boolean;
  stack: string[];
  /** Two colours from the palette used for the generated cover art. */
  palette: [string, string];
  /** Optional real screenshot paths in /public/images/projects. */
  thumbnail?: string;
  screenshots?: { src?: string; caption: string }[];
  links: { github?: string; demo?: string };
  problem: string;
  architecture: { nodes: { label: string; note?: string }[]; summary: string };
  decisions: { title: string; why: string }[];
  challenges: { title: string; detail: string }[];
  results: string[];
  learnings: string[];
};

export const statusLabel: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  prototype: "Prototype",
  archived: "Archived",
};

export const projects: Project[] = [
  {
    slug: "sample-realtime-notes",
    name: "[Sample] Realtime Notes",
    summary: "SAMPLE — a collaborative notes app that syncs edits between tabs and devices.",
    headline: "Local Developer Teaches Notes To Talk To Each Other",
    year: "[Year]",
    role: "[Your role on the project]",
    status: "shipped",
    featured: true,
    sample: true,
    stack: ["TypeScript", "Next.js", "WebSockets", "PostgreSQL"],
    palette: ["#FFD84D", "#477BFF"],
    screenshots: [{ caption: "[Screenshot] Editor view" }, { caption: "[Screenshot] Sync indicator" }],
    links: { github: "https://github.com/your-username/your-repo", demo: "https://example.com" },
    problem:
      "SAMPLE — Describe the problem in plain language: who had it, why existing tools didn't solve it, and what a good outcome looked like.",
    architecture: {
      summary: "SAMPLE — Summarise how the pieces fit together and why it's shaped this way.",
      nodes: [
        { label: "Client", note: "editor UI" },
        { label: "Sync layer", note: "CRDT / OT" },
        { label: "API", note: "auth + rooms" },
        { label: "Database", note: "snapshots" },
      ],
    },
    decisions: [
      { title: "[Decision one]", why: "SAMPLE — what you chose, what you rejected and the trade-off." },
      { title: "[Decision two]", why: "SAMPLE — what constraint forced this choice." },
    ],
    challenges: [
      { title: "[Challenge]", detail: "SAMPLE — the hardest bug or design problem and how you got through it." },
      { title: "[Challenge]", detail: "SAMPLE — a performance or scaling issue you had to solve." },
    ],
    results: ["SAMPLE — a real, verifiable result (do not invent metrics)."],
    learnings: ["SAMPLE — something you'd do differently next time."],
  },
  {
    slug: "sample-cli-toolkit",
    name: "[Sample] Dev CLI Toolkit",
    summary: "SAMPLE — a command-line tool that automates a repetitive part of a developer workflow.",
    headline: "Terminal Tool Saves Keystrokes, Sanity",
    year: "[Year]",
    role: "[Your role]",
    status: "in-progress",
    featured: true,
    sample: true,
    stack: ["Go", "Docker", "GitHub Actions"],
    palette: ["#9DDC8B", "#171717"],
    screenshots: [{ caption: "[Screenshot] CLI output" }],
    links: { github: "https://github.com/your-username/your-repo" },
    problem: "SAMPLE — What was slow, error-prone or boring before this tool existed?",
    architecture: {
      summary: "SAMPLE — Explain the command structure, plugins or pipeline.",
      nodes: [
        { label: "CLI", note: "commands" },
        { label: "Core", note: "task runner" },
        { label: "Plugins", note: "extensible" },
      ],
    },
    decisions: [{ title: "[Decision]", why: "SAMPLE — e.g. why a single static binary." }],
    challenges: [{ title: "[Challenge]", detail: "SAMPLE — cross-platform quirks, testing, distribution." }],
    results: ["SAMPLE — who uses it and what changed for them."],
    learnings: ["SAMPLE — what building it taught you."],
  },
  {
    slug: "sample-ai-assistant",
    name: "[Sample] Docs Assistant",
    summary: "SAMPLE — an LLM-powered assistant that answers questions about a codebase's docs.",
    headline: "Robot Reads The Manual So You Don't Have To",
    year: "[Year]",
    role: "[Your role]",
    status: "prototype",
    featured: true,
    sample: true,
    stack: ["Python", "FastAPI", "LLMs", "Vector DB"],
    palette: ["#FF755E", "#F5EBD8"],
    screenshots: [{ caption: "[Screenshot] Chat UI" }, { caption: "[Screenshot] Source citations" }],
    links: { github: "https://github.com/your-username/your-repo", demo: "https://example.com" },
    problem: "SAMPLE — Why was finding answers in the docs painful?",
    architecture: {
      summary: "SAMPLE — Ingestion, retrieval and generation pipeline.",
      nodes: [
        { label: "Ingest", note: "chunk + embed" },
        { label: "Vector store" },
        { label: "Retriever" },
        { label: "LLM", note: "cited answers" },
      ],
    },
    decisions: [{ title: "[Decision]", why: "SAMPLE — chunking strategy, model choice, evals." }],
    challenges: [{ title: "[Challenge]", detail: "SAMPLE — hallucinations, latency, cost." }],
    results: ["SAMPLE — qualitative or measured outcome."],
    learnings: ["SAMPLE — what you learnt about building with LLMs."],
  },
  {
    slug: "sample-3d-experiment",
    name: "[Sample] WebGL Sketchbook",
    summary: "SAMPLE — a collection of small three.js experiments and shaders.",
    headline: "Pixels Caught Doing Something Unexpected",
    year: "[Year]",
    role: "[Your role]",
    status: "archived",
    sample: true,
    stack: ["Three.js", "GLSL", "React"],
    palette: ["#477BFF", "#FFD84D"],
    screenshots: [{ caption: "[Screenshot] Shader study" }],
    links: { demo: "https://example.com" },
    problem: "SAMPLE — What were you trying to learn or prove?",
    architecture: {
      summary: "SAMPLE — How the experiments are organised.",
      nodes: [{ label: "Sketch" }, { label: "Renderer" }, { label: "Post FX" }],
    },
    decisions: [{ title: "[Decision]", why: "SAMPLE — why this approach." }],
    challenges: [{ title: "[Challenge]", detail: "SAMPLE — performance on mobile GPUs." }],
    results: ["SAMPLE — what came out of it."],
    learnings: ["SAMPLE — the most surprising lesson."],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
