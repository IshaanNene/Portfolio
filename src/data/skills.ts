import type { SimpleIcon } from "simple-icons";
import {
  siGo, siRust, siTypescript, siPython, siCplusplus, siOpenjdk, siErlang,
  siApachekafka, siGraphql, siNodedotjs,
  siKubernetes, siDocker, siTerraform, siHelm, siArgo, siGithubactions,
  siPostgresql, siRedis, siDuckdb, siClickhouse, siOpensearch,
  siPrometheus, siGrafana, siOpentelemetry, siJaeger,
  siLangchain, siModelcontextprotocol, siPydantic,
  siJest, siGit, siLinux,
} from "simple-icons";

/**
 * STACK — the filing cabinet at /stack.
 * Taken from my resume; each note points at where I used it.
 */

export type SkillLevel = "daily" | "comfortable" | "learning";

export type Skill = {
  name: string;
  icon?: SimpleIcon;
  level: SkillLevel;
  note: string;
};

export type Drawer = {
  id: string;
  label: string;
  code: string;
  color: string;
  description: string;
  skills: Skill[];
};

export const levelLabel: Record<SkillLevel, string> = {
  daily: "Daily driver",
  comfortable: "Comfortable",
  learning: "Learning",
};

const s = (name: string, icon: SimpleIcon | undefined, level: SkillLevel, note: string): Skill => ({ name, icon, level, note });

export const drawers: Drawer[] = [
  {
    id: "languages",
    label: "Languages",
    code: "A-01",
    color: "#FFD84D",
    description: "The words I think in.",
    skills: [
      s("Go", siGo, "daily", "Chess platform services, ScrapeGoat, kaas, TracePoint."),
      s("Rust", siRust, "daily", "Meridian's twelve services; Chronoscope's simulator and Raft log."),
      s("TypeScript", siTypescript, "daily", "IBM's local CI validation CLI and dashboard; this site."),
      s("Python", siPython, "daily", "DebugAssist, Faultline, and the NL-to-SQL pipeline at IBM."),
      s("C / C++", siCplusplus, "comfortable", "StegaNet, an OpenACC chess engine, convolution on Metal."),
      s("Java", siOpenjdk, "comfortable", "TestNG suites, an MCP client and JZOS on z/OS at IBM."),
      s("Erlang", siErlang, "comfortable", "One supervised gen_server per live chess game."),
      s("SQL", undefined, "daily", "Postgres with row-level security, DuckDB, ClickHouse."),
    ],
  },
  {
    id: "systems",
    label: "Systems",
    code: "A-02",
    color: "#FF755E",
    description: "Services, APIs and the plumbing nobody sees.",
    skills: [
      s("Distributed systems", undefined, "daily", "Event-driven services with outboxes and exactly-once ratings."),
      s("Raft", undefined, "comfortable", "Chronoscope's replicated write-ahead log."),
      s("Deterministic simulation", undefined, "comfortable", "One seed, virtual clock, network and disk."),
      s("Apache Kafka", siApachekafka, "daily", "Meridian's event bus, chess analysis, kaas."),
      s("gRPC", undefined, "daily", "Between Meridian's services and the chess platform's."),
      s("GraphQL", siGraphql, "comfortable", "The chess gateway, with live subscriptions."),
      s("Node.js", siNodedotjs, "daily", "The validation platform at IBM."),
    ],
  },
  {
    id: "infra",
    label: "Infrastructure",
    code: "B-01",
    color: "#477BFF",
    description: "Where the code lives once it leaves my laptop.",
    skills: [
      s("Kubernetes", siKubernetes, "comfortable", "The chess platform, GitOps-style."),
      s("Docker", siDocker, "daily", "Judges for EliteCode, DebugAssist's no-network sandbox."),
      s("Terraform", siTerraform, "comfortable", "AWS for Meridian; certified on IBM Cloud."),
      s("Helm", siHelm, "comfortable", "Charts for Meridian and the chess platform."),
      s("Argo CD", siArgo, "comfortable", "Reconciles the chess platform from the repo."),
      s("GitHub Actions", siGithubactions, "daily", "CI with vulnerability scans; deploys this site."),
    ],
  },
  {
    id: "data",
    label: "Data",
    code: "B-02",
    color: "#9DDC8B",
    description: "Places where data sleeps (and sometimes wakes up angry).",
    skills: [
      s("PostgreSQL", siPostgresql, "daily", "Row-level security for tenancy; the transactional outbox."),
      s("Redis", siRedis, "comfortable", "Live hints over Redis Streams; job queues."),
      s("DuckDB", siDuckdb, "comfortable", "Read-only generated SQL at IBM."),
      s("ClickHouse", siClickhouse, "comfortable", "Meridian's analytics facts."),
      s("OpenSearch", siOpensearch, "comfortable", "Meridian's search index, fed from Kafka."),
    ],
  },
  {
    id: "observability",
    label: "Observability",
    code: "C-01",
    color: "#F5EBD8",
    description: "How I find out what the system actually did.",
    skills: [
      s("Prometheus", siPrometheus, "comfortable", "RED and chess-specific metrics; alerts for Meridian."),
      s("Grafana", siGrafana, "comfortable", "Dashboards for the chess platform under load."),
      s("OpenTelemetry", siOpentelemetry, "comfortable", "Trace context from the MiniRide app to its gateway."),
      s("Jaeger", siJaeger, "comfortable", "One chess move traced across three services."),
    ],
  },
  {
    id: "ai",
    label: "AI & Agents",
    code: "C-02",
    color: "#FFFFFF",
    description: "Models, guardrails, evals and the glue between them.",
    skills: [
      s("watsonx.ai", undefined, "daily", "The NL-to-SQL pipeline at IBM."),
      s("LangChain", siLangchain, "comfortable", "The same pipeline; LangGraph for DebugAssist."),
      s("Model Context Protocol", siModelcontextprotocol, "daily", "ScrapeGoat's server; DebugAssist's eleven."),
      s("Pydantic", siPydantic, "comfortable", "Structured output for the job-failure classifier."),
    ],
  },
  {
    id: "testing",
    label: "Testing & Tools",
    code: "D-01",
    color: "#FFD84D",
    description: "The everyday kit on the desk.",
    skills: [
      s("Jest", siJest, "comfortable", "Tests for the TypeScript tooling."),
      s("TestNG", undefined, "comfortable", "97 functional verification tests at IBM."),
      s("Playwright", undefined, "comfortable", "End-to-end browser tests."),
      s("Benchmarking", undefined, "daily", "ScrapeGoat's 31 published benchmarks."),
      s("Git", siGit, "daily", "Worktrees, history and the occasional bisect."),
      s("Linux", siLinux, "daily", "Where everything runs."),
      s("z/OS", undefined, "comfortable", "JZOS, EBCDIC and program libraries at IBM."),
    ],
  },
];

export const allSkills = drawers.flatMap((d) => d.skills.map((sk) => ({ ...sk, drawer: d.label })));
