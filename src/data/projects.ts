/**
 * PROJECTS — add a new object to `projects` and it automatically gets:
 *   • a Polaroid on /projects
 *   • a case-file page at /projects/<slug>
 *   • a newspaper clipping (when `featured: true`)
 *   • a diary + terminal mention
 *
 * Entries come from the READMEs of my GitHub repos.
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
    slug: "meridian",
    name: "Meridian",
    summary: "A multi-tenant project tracker in the style of Jira — twelve Rust microservices, a React app and an event-driven core.",
    headline: "Local Engineer Rebuilds Jira, Refuses To Stop At The UI",
    year: "2026",
    role: "Author",
    status: "in-progress",
    featured: true,
    stack: ["Rust", "Axum", "Tonic", "SQLx", "React", "TypeScript", "PostgreSQL", "Kafka", "OpenSearch", "ClickHouse", "Helm", "Terraform"],
    palette: ["#477BFF", "#FFD84D"],
    screenshots: [{ caption: "Sprint board" }, { caption: "Workflow designer" }],
    links: { github: "https://github.com/IshaanNene/Jira", demo: "https://ishaannene.github.io/Jira/" },
    problem:
      "Most clones stop at the UI. Meridian's goal is the whole system behind one — boards, sprints, workflows, search, live updates and dashboards — built with production constraints from the first commit.",
    architecture: {
      summary:
        "Every write lands in a transactional outbox, flows through Kafka, and feeds search, notifications, live updates and analytics. The tenant comes only from a signed token, and PostgreSQL row-level security enforces it underneath the application code.",
      nodes: [
        { label: "React app", note: "boards & sprints" },
        { label: "Rust services", note: "Axum + Tonic" },
        { label: "Postgres", note: "RLS + outbox" },
        { label: "Kafka", note: "event bus" },
        { label: "Search & analytics", note: "OpenSearch, ClickHouse" },
      ],
    },
    decisions: [
      { title: "Row-level security for tenancy", why: "Tenant isolation is enforced by PostgreSQL underneath the app code, not only by application checks." },
      { title: "Transactional outbox", why: "Writes and their events commit together, so search, notifications and analytics never drift from the source of truth." },
      { title: "Closed-set workflow rules", why: "Conditions, validators and post-functions come from closed sets, so no user code ever runs." },
    ],
    challenges: [
      { title: "Gap-free issue keys", detail: "Issue keys stay gap-free even under concurrent creation." },
      { title: "Operating it for real", detail: "Distroless images, a Helm chart, Terraform for AWS, CI with vulnerability scans, Prometheus alerts, and load and failure tests." },
    ],
    results: [
      "Scrum and Kanban boards, sprints, burndown and velocity reports working end to end",
      "A visual workflow designer with immutable published versions",
      "An implementation roadmap that records what works, how it was verified and what's still missing",
    ],
    learnings: ["[PLACEHOLDER] what building Meridian taught you"],
  },
  {
    slug: "debugassist",
    name: "DebugAssist",
    summary: "An autonomous on-call engineer: crash or bug report in → triage, evidence-backed root cause, a failing test, the fix, proof, and a pull request out.",
    headline: "Robot On-Call Engineer Writes Its Own Failing Test",
    year: "2026",
    role: "Author",
    status: "in-progress",
    featured: true,
    stack: ["Python", "LangGraph", "MCP", "Docker", "Cloudflare", "GitHub API", "Jira"],
    palette: ["#FF755E", "#9DDC8B"],
    screenshots: [{ caption: "Dashboard" }, { caption: "A run, from crash to PR" }],
    links: { github: "https://github.com/IshaanNene/DebugAssist", demo: "https://ishaannene.github.io/DebugAssist/" },
    problem:
      "Turn a crash or bug report for a ride-hailing app into a triaged, root-caused, tested fix — with every claim backed by evidence and every write gated by policy.",
    architecture: {
      summary:
        "The plan is a fixed LangGraph graph; models never choose the next step. Agents query 11 MCP servers (crash analytics, logs, traces, metrics, flags, git history, code search, releases, incidents, bug reports, Jira) and work in a network-less Docker sandbox on a git worktree.",
      nodes: [
        { label: "Crash / bug report" },
        { label: "Clef decisions", note: "18 templates" },
        { label: "LLM agents", note: "11 MCP servers" },
        { label: "Sandbox", note: "no network" },
        { label: "Policy gate", note: "PR · ticket · flag" },
      ],
    },
    decisions: [
      { title: "Models reason, code acts", why: "Every judgement call is one of 18 Cloudflare Clef decision templates; LLMs write the reasoning; a fixed graph decides what happens next." },
      { title: "Evidence-backed root causes", why: "Every claim in a root cause cites the evidence it came from." },
    ],
    challenges: [
      { title: "Safe writes", detail: "Every PR, ticket or flag rollback passes a policy gate, and the agents work in a sandbox with no network." },
      { title: "Reproducible evaluation", detail: "The evaluation report can be regenerated from committed runs on an anonymous clone." },
    ],
    results: ["Runs end to end from a crash report to a pull request", "A keyless demo mode with scripted LLM and mocked integrations"],
    learnings: ["[PLACEHOLDER] what building DebugAssist taught you"],
  },
  {
    slug: "alekhines-counter-gambit",
    name: "Alekhine's Counter-Gambit",
    summary: "A distributed chess platform: play Stockfish or a friend live, with moves validated, streamed, analysed and observed on Kubernetes.",
    headline: "Chess App Turns Out To Be A Distributed System In Disguise",
    year: "2026",
    role: "Author",
    status: "shipped",
    featured: true,
    stack: ["Go", "Erlang/OTP", "gRPC", "GraphQL", "Kafka", "Redis", "PostgreSQL", "Kubernetes", "ArgoCD", "Grafana"],
    palette: ["#FFD84D", "#171717"],
    screenshots: [{ caption: "Playing Stockfish" }, { caption: "Post-game analysis" }, { caption: "Grafana under load" }],
    links: { github: "https://github.com/IshaanNene/AlekhinesCounter-Gambit" },
    problem:
      "Playing chess online looks simple; the platform behind it is a full tour of distributed systems — authoritative rules on the server, live move streaming, compute-heavy analysis that never blocks play, clocks, ratings that update exactly once.",
    architecture: {
      summary:
        "Independently scalable services over gRPC and a Kafka event bus, with durable storage, live WebSocket fan-out, full metrics and traces, and a GitOps pipeline onto Kubernetes.",
      nodes: [
        { label: "Web client", note: "WebSockets" },
        { label: "Gateway", note: "GraphQL" },
        { label: "Game service", note: "Go + Erlang" },
        { label: "Engine workers", note: "Stockfish" },
        { label: "Kafka", note: "post-game analysis" },
      ],
    },
    decisions: [
      { title: "Never trust the client", why: "Rules are enforced authoritatively on the server." },
      { title: "Asynchronous analysis", why: "Finished games are analysed by a Kafka-fed worker pool so engine work never blocks play." },
    ],
    challenges: [
      { title: "Clocks and ratings", detail: "Clocks must never flag-fall a decided game, and ratings must update exactly once." },
      { title: "Observability", detail: "A single move request is traced across gateway → game-service → engine-worker in Jaeger." },
    ],
    results: ["Built in four quarterly releases", "Runs on Kubernetes, reconciled from the repo by ArgoCD"],
    learnings: ["[PLACEHOLDER] what building it taught you"],
  },
  {
    slug: "scrapegoat",
    name: "ScrapeGoat",
    summary: "A web crawler for Go and an MCP server in one binary — point it at a URL and get structured data.",
    headline: "Goat Eats Websites, Returns Tidy JSON",
    year: "2026",
    role: "Author",
    status: "shipped",
    stack: ["Go", "MCP", "REST"],
    palette: ["#9DDC8B", "#477BFF"],
    screenshots: [{ caption: "scrapegoat extract" }],
    links: { github: "https://github.com/IshaanNene/ScrapeGoat" },
    problem: "Get structured data out of pages whose markup nobody anticipated — without writing selectors or config.",
    architecture: {
      summary: "One binary with four entry points: a CLI, a Go library, an MCP server for agents like Claude or Cursor, and a REST API for other languages.",
      nodes: [
        { label: "CLI", note: "extract · crawl" },
        { label: "Library", note: "spiders in Go" },
        { label: "MCP server", note: "for agents" },
        { label: "REST API" },
      ],
    },
    decisions: [
      { title: "Find listings by structure", why: "It looks for repeated sibling elements that mostly contain a price and a link, rather than guessing at class names." },
      { title: "Progress to stderr, JSON to stdout", why: "So it pipes cleanly into tools like jq." },
    ],
    challenges: [{ title: "Selector-free extraction", detail: "Working on sites whose markup nobody anticipated." }],
    results: ["Installable with go install", "Usable from the CLI, Go, an AI agent or a REST client"],
    learnings: ["[PLACEHOLDER] what building it taught you"],
  },
  {
    slug: "steganet",
    name: "StegaNet",
    summary: "Steganography in C over sockets: hide text, images and audio inside media and send them between machines.",
    headline: "Messages Found Hiding Inside Perfectly Normal Pictures",
    year: "2026",
    role: "Author",
    status: "shipped",
    stack: ["C", "Sockets", "Raylib", "AES-256", "Make"],
    palette: ["#FF755E", "#FFD84D"],
    screenshots: [{ caption: "Chat UI" }],
    links: { github: "https://github.com/IshaanNene/StegaNet" },
    problem: "Exchange hidden messages — text, images and audio — over a network, with encryption and integrity checks.",
    architecture: {
      summary: "A centralised AppState model orchestrates multi-threaded networking away from the Raylib UI thread using mutexes.",
      nodes: [
        { label: "Raylib UI" },
        { label: "AppState", note: "mutexes" },
        { label: "Stego codec", note: "image · audio LSB" },
        { label: "TCP sockets", note: "framed" },
      ],
    },
    decisions: [
      { title: "Length-prefixed framing", why: "Structured messages travel over TCP with explicit framing." },
      { title: "Encrypt and verify", why: "AES-256-CBC payload encryption with CRC32 integrity checks." },
    ],
    challenges: [{ title: "A resilient protocol", detail: "Keep-alive pings, timeouts and latency measurement between nodes." }],
    results: ["Image steganography up to 4KB across R, G, B channels", "Audio steganography with LSB manipulation"],
    learnings: ["[PLACEHOLDER] what building it taught you"],
  },
  {
    slug: "cheersmate",
    name: "CheersMate",
    summary: "Browse, organise and manage Homebrew packages — favourites, custom groups, usage stats and one-click operations.",
    headline: "Homebrew Finally Gets A Bartender",
    year: "2026",
    role: "Author",
    status: "shipped",
    stack: ["TypeScript", "Homebrew"],
    palette: ["#B5835A", "#477BFF"],
    screenshots: [{ caption: "Package browser" }],
    links: { github: "https://github.com/IshaanNene/CheersMate" },
    problem: "Managing Homebrew packages from the terminal is fine until you have a lot of them.",
    architecture: {
      summary: "A UI over Homebrew with favourites, custom groups and usage stats, plus maintenance tools.",
      nodes: [{ label: "UI" }, { label: "Package manager", note: "install · upgrade · pin" }, { label: "Maintenance", note: "health · cleanup" }],
    },
    decisions: [{ title: "One-click operations", why: "Install, upgrade, uninstall and pin without remembering flags." }],
    challenges: [{ title: "Keeping it healthy", detail: "Health checks, cleanup and auto-update scheduling." }],
    results: ["Favourites, custom groups and usage stats for Homebrew packages"],
    learnings: ["[PLACEHOLDER] what building it taught you"],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
