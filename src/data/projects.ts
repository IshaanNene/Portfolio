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

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Real screenshot under public/images/projects/<slug>/. */
const shot = (slug: string, file: string) => `${base}/images/projects/${slug}/${file}.webp`;

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
    thumbnail: shot("meridian", "board"),
    screenshots: [
      { src: shot("meridian", "board"), caption: "Scrum board, mid-sprint" },
      { src: shot("meridian", "workflow"), caption: "Visual workflow designer" },
      { src: shot("meridian", "issue"), caption: "An issue, with history" },
      { src: shot("meridian", "dashboard"), caption: "Dashboards" },
    ],
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
      "Load test on one laptop (3-node kind cluster): 1,000 reads/s at 7 ms p50 and 70 ms p99 with zero failures",
      "Uncapped writes: 1,799/s served, 0 of 35,967 failed, and Kafka delivered all ~40,000 events to search and analytics",
      "Scrum and Kanban boards, sprints, burndown and velocity reports working end to end",
      "A visual workflow designer with immutable published versions",
      "An implementation roadmap that records what works, how it was verified and what's still missing",
    ],
    learnings: ["The query engines saturated before the services did — measure before tuning anything.", "Pushing tenancy down into PostgreSQL row-level security means a buggy query still can't read another tenant's rows."],
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
    thumbnail: shot("debugassist", "report"),
    screenshots: [
      { src: shot("debugassist", "report"), caption: "Run report — overview" },
      { src: shot("debugassist", "root-cause"), caption: "Root cause, with cited evidence" },
      { src: shot("debugassist", "cli"), caption: "A run from the CLI" },
      { src: shot("debugassist", "trace"), caption: "The crash, traced in Jaeger" },
    ],
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
    results: [
      "On 25 injected bugs × 3 seeds: root cause right or close in 80% of runs, exact in 65%",
      "Hidden tests passed on 80% of fixes, at a median $0.014 a run",
      "32 prompt-injection payloads in the tests; every external write goes through a policy file and an audit log",
      "A keyless demo mode with a scripted LLM and mocked integrations",
    ],
    learnings: ["An agent is only as trustworthy as its evidence: every root-cause claim has to cite something.", "Write the caveats next to the numbers — synthetic bugs show strengths and gaps, not real-world rates."],
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
    thumbnail: shot("alekhines-counter-gambit", "game"),
    screenshots: [
      { src: shot("alekhines-counter-gambit", "game"), caption: "Playing Stockfish" },
      { src: shot("alekhines-counter-gambit", "analysis"), caption: "Post-game analysis" },
      { src: shot("alekhines-counter-gambit", "grafana"), caption: "Grafana under load" },
      { src: shot("alekhines-counter-gambit", "jaeger"), caption: "One move across three services" },
    ],
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
    results: [
      "Six services over gRPC and Kafka: gateway, game, session (Erlang/OTP), engine worker, analysis worker, spectator fan-out",
      "Move generation verified by perft: 197,281 nodes to depth 4 from the start position",
      "17.6k lines, 118 tests and five architecture decision records",
      "Runs on Kubernetes, reconciled from the repo by Argo CD",
    ],
    learnings: ["One supervised Erlang process per game means killing a game never touches another.", "Verify the move generator with perft before trusting anything built on top of it."],
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
    thumbnail: shot("scrapegoat", "site"),
    screenshots: [{ src: shot("scrapegoat", "site"), caption: "The product site" }],
    links: { github: "https://github.com/IshaanNene/ScrapeGoat", demo: "https://ishaannene.github.io/ScrapeGoat/" },
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
    challenges: [
      { title: "Selector-free extraction", detail: "Working on sites whose markup nobody anticipated." },
      { title: "Fetching URLs someone else chose", detail: "Requests to loopback, private, link-local and CGNAT ranges are blocked after DNS; the guard dials the address it validated, so DNS rebinding fails; bodies are capped after decompression." },
    ],
    results: [
      "Replaced a 50 ms polling loop in the frontier with an event-driven queue: wake latency 49.1 ms → 3.0 µs",
      "31 published benchmarks, with their method",
      "Apache-2.0: 40k lines of Go, 541 tests, 16 merged pull requests",
      "Usable from the CLI, Go, an AI agent or a REST client",
    ],
    learnings: ["A crawler fetches URLs someone else chose — that is the whole threat model.", "Delete unwired features instead of leaving them looking finished."],
  },
  {
    slug: "chronoscope",
    name: "Chronoscope",
    summary: "A deterministic simulation testbed, and a Raft-replicated write-ahead log built inside it to be broken on purpose.",
    headline: "One Seed Breaks Consensus Eighteen Different Ways",
    year: "2026",
    role: "Author",
    status: "shipped",
    featured: true,
    stack: ["Rust", "Raft", "Deterministic simulation"],
    palette: ["#9DDC8B", "#FF755E"],
    links: { github: "https://github.com/IshaanNene/ChronoScope" },
    problem:
      "Consensus and storage bugs hide in rare interleavings of network, disk and clock events. Real clusters can't replay them; a deterministic simulator can, bit for bit, from a seed.",
    architecture: {
      summary:
        "chrono-sim virtualises the network, disk, clocks and thread interleaving behind traits, driven by one seeded PRNG on a single thread. chronolog, a real Raft-replicated, crash-consistent log, is written against those traits — so the same code runs in the simulator and on real hardware.",
      nodes: [
        { label: "Seed", note: "one PRNG" },
        { label: "chrono-sim", note: "virtual clock · net · disk" },
        { label: "chronolog", note: "Raft + WAL" },
        { label: "Oracle", note: "linearizability · liveness" },
        { label: "BUGS.md", note: "18 found" },
      ],
    },
    decisions: [
      { title: "Never name a socket", why: "chronolog never touches a socket, file descriptor, clock or thread directly, so the simulator can swap all of them." },
      { title: "Check behaviour, not code paths", why: "A linearizability and liveness oracle decides whether a run was correct." },
    ],
    challenges: [
      { title: "Bit-for-bit reproduction", detail: "Given a seed, a failing run replays exactly — which is what makes a consensus bug fixable." },
      { title: "Fix with proof", detail: "Every fix carries a regression test that reproduces the original seed." },
    ],
    results: [
      "18 real consensus and storage bugs found, 16 fixed, each with a regression test",
      "86.7 simulated node-hours in 95.07 s of wall clock (3,282×)",
      "After the fixes, 200 of 200 seeds run 400 simulated seconds without a failure",
      "17.3k lines of Rust, 203 tests",
    ],
    learnings: ["Raft on paper and Raft under a hostile scheduler are different algorithms.", "A seed you can replay turns a heisenbug into an ordinary one."],
  },
  {
    slug: "kaas",
    name: "kaas",
    summary: "Kafka as a Service: a CLI and terminal UI for any Kafka cluster, a management plane, and managed Kafka on Kubernetes — on one cluster-state engine.",
    headline: "One Binary Promises To Tell You What Kafka Is Doing",
    year: "2026",
    role: "Author",
    status: "in-progress",
    stack: ["Go", "Kafka", "Kubernetes", "Strimzi", "GitOps"],
    palette: ["#477BFF", "#9DDC8B"],
    thumbnail: shot("kaas", "fleet"),
    screenshots: [
      { src: shot("kaas", "fleet"), caption: "Fleet view in the console" },
      { src: shot("kaas", "gitops"), caption: "GitOps plans" },
      { src: shot("kaas", "insights"), caption: "Cluster insights" },
    ],
    links: { github: "https://github.com/IshaanNene/Kafka-as-a-Service" },
    problem: "Know what a Kafka cluster is doing, change it safely, and move data through it — without a different tool for each job.",
    architecture: {
      summary: "Three products share one cluster-state engine: the kaas CLI/TUI, a management plane for many clusters (GitOps plans, schemas, ACLs, quotas) in a web console, and managed Kafka on Kubernetes via Strimzi.",
      nodes: [
        { label: "kaas CLI / TUI" },
        { label: "Cluster-state engine" },
        { label: "Management plane", note: "GitOps · ACLs · quotas" },
        { label: "Managed Kafka", note: "Strimzi on k8s" },
      ],
    },
    decisions: [
      { title: "Screens on a terminal, text on a pipe", why: "Every command draws a screen built for its job; piped, it prints stable text, and -o json prints JSON." },
      { title: "One engine, three products", why: "The CLI, console and operator agree because they read the same cluster state." },
    ],
    challenges: [{ title: "Changing a live cluster safely", detail: "Changes are planned GitOps-style before they're applied." }],
    results: ["The CLI/TUI, the management plane and managed Kafka on Strimzi are all available now"],
    learnings: ["A tool for on-call should be as useful in a pipe as on a screen."],
  },
  {
    slug: "elitecode",
    name: "EliteCode & AlgoRank",
    summary: "A competitive-programming platform — problems, contests, an editor and a leaderboard — and the judge that runs the submissions.",
    headline: "Student Builds A LeetCode, Then The Judge Behind It",
    year: "2025",
    role: "Author",
    status: "shipped",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Go", "Docker"],
    palette: ["#FFD84D", "#FF755E"],
    links: { github: "https://github.com/IshaanNene/EliteCode" },
    problem: "Run untrusted code from strangers, in four languages, fairly — and keep a leaderboard honest.",
    architecture: {
      summary: "A Next.js platform with auth on Supabase/PostgreSQL. Submissions run in per-language Docker images, each with a test runner written in that language.",
      nodes: [
        { label: "Next.js app", note: "problems · contests" },
        { label: "Supabase", note: "auth · Postgres" },
        { label: "Judge", note: "Go" },
        { label: "Docker runners", note: "C++ · Go · Java · Python" },
      ],
    },
    decisions: [{ title: "A runner per language", why: "Each language gets its own image and a test runner written in that language, so results don't depend on a translation layer." }],
    challenges: [{ title: "Isolation", detail: "Every submission runs in its own container." }],
    results: ["Problems, contests, an editor, a leaderboard and auth"],
    learnings: ["The judge is the product; the website is the queue in front of it."],
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
    learnings: ["Frame every message and checksum it, so corruption is detected instead of decoded into garbage."],
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
    links: { github: "https://github.com/IshaanNene/CheersMate" },
    problem: "Managing Homebrew packages from the terminal is fine until you have a lot of them.",
    architecture: {
      summary: "A UI over Homebrew with favourites, custom groups and usage stats, plus maintenance tools.",
      nodes: [{ label: "UI" }, { label: "Package manager", note: "install · upgrade · pin" }, { label: "Maintenance", note: "health · cleanup" }],
    },
    decisions: [{ title: "One-click operations", why: "Install, upgrade, uninstall and pin without remembering flags." }],
    challenges: [{ title: "Keeping it healthy", detail: "Health checks, cleanup and auto-update scheduling." }],
    results: ["Favourites, custom groups and usage stats for Homebrew packages"],
    learnings: ["A UI over a CLI earns its place once the list gets long."],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
