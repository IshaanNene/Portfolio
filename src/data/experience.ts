/**
 * EXPERIENCE — printed on the receipt at /experience.
 * From my resume.
 */

export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  type: "full-time" | "internship" | "freelance" | "open-source" | "education";
  responsibilities: string[];
  achievements: string[];
  impact: string;
  stack: string[];
  placeholder?: boolean;
};

export const experience: ExperienceEntry[] = [
  {
    id: "ibm-sde",
    role: "Software Development Engineer",
    company: "IBM",
    location: "Bengaluru, India",
    start: "Jun 2026",
    end: "Present",
    type: "full-time",
    responsibilities: [
      "Developer tooling and mainframe modernisation for IBM Z",
      "Built a validation platform that runs a project's CI checks on an engineer's own machine before anything is pushed: a TypeScript/Node CLI of 34 commands, a web dashboard and an agent mode",
      "Put 28+ security and analysis tools (gitleaks, Trivy, checkov, SonarQube) behind one scanner interface with SARIF-compatible output, feeding an auto-fix engine with confidence scores, dry-run diffs, backups and rollback",
      "Continued the Easytrieve-to-COBOL migration tool from the internship; hand-built IBM's Carbon Design System for the dashboard in plain HTML and CSS",
    ],
    achievements: [
      "A typical project validates in 2–5 minutes locally against a 15–20 minute wait on the remote pipeline; a repeat run takes 3–8 seconds",
      "Made it fast in layers: a priority-ordered worker pool, incremental scans that follow git changes through an import graph, a two-level content-hash cache, and a worker count that scales with CPU, memory and I/O load",
    ],
    impact: "Engineers find out whether CI will pass in minutes, on their own machine, instead of waiting on the remote pipeline.",
    stack: ["TypeScript", "Node.js", "SARIF", "Carbon Design System", "COBOL", "z/OS"],
  },
  {
    id: "ibm-intern",
    role: "Software Engineering Intern",
    company: "IBM",
    location: "Bengaluru, India",
    start: "Jan 2026",
    end: "Jun 2026",
    type: "internship",
    responsibilities: [
      "Built a natural-language-to-SQL pipeline over mainframe job-scheduler data on watsonx.ai and LangChain, running generated DuckDB SQL read-only",
      "Built a classifier that sorts failed scheduler jobs into six failure categories with Pydantic structured output, after a pre-processing step that strips noise to cut wasted tokens",
      "Built the migration tool's program classifier: reads program libraries natively on z/OS through JZOS (EBCDIC included) and sorts each program by how it must be migrated",
    ],
    achievements: [
      "Hardened the NL-to-SQL pipeline with two independent checks — an LLM intent classifier that fails closed, then deterministic SQL validation (table allow-list including CTEs, forbidden keywords, injection patterns, cross joins) — covered by 50+ tests, adversarial cases included",
      "Wrote the functional verification suite: 97 TestNG tests and a Java MCP client exercising the server end to end, plus an AI agent skill with 17 OpenSpec specifications",
      "Post-migration reporting that processes up to 20 datasets concurrently with thread-safe writes back to z/OS",
      "Converted to a full-time role in June 2026",
    ],
    impact: "Made an LLM-backed query tool safe to point at real scheduler data, and gave the migration a plan it can run in waves.",
    stack: ["Python", "watsonx.ai", "LangChain", "DuckDB", "Pydantic", "Java", "JZOS", "TestNG", "MCP"],
  },
  {
    id: "pes",
    role: "B.Tech, Computer Science and Engineering",
    company: "PES University",
    location: "Bengaluru, India",
    start: "Sep 2022",
    end: "Jun 2026",
    type: "education",
    responsibilities: [
      "Coursework: Operating Systems, Computer Networks, DBMS, Cloud Computing, Big Data, Heterogeneous Parallelism, OOAD, Data Structures & Algorithms",
      "Capstone: multimodal LLMs on fog computing for smart farming",
    ],
    achievements: [
      "GPA 8.77 / 10",
      "CNR Scholarship (2×) and DAC Scholarship (4×) for academic performance",
      "Second place, Kaggle Data Analytics Hackathon (Nov 2024)",
    ],
    impact: "Four years of systems coursework, and most of the side projects on this site.",
    stack: ["Operating systems", "Networks", "Distributed systems", "Parallelism"],
  },
];

/** Career milestones that print as "special" lines on the receipt. */
export const careerMilestones: { label: string; date: string }[] = [
  { label: "2nd place, Kaggle Data Analytics Hackathon", date: "Nov 2024" },
  { label: "Joined IBM as an intern", date: "Jan 2026" },
  { label: "Graduated, PES University", date: "Jun 2026" },
  { label: "Converted to full-time at IBM", date: "Jun 2026" },
];
