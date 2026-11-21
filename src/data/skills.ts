import type { SimpleIcon } from "simple-icons";
import {
  siTypescript, siJavascript, siPython, siGo, siRust, siCplusplus, siKotlin,
  siReact, siNextdotjs, siTailwindcss, siThreedotjs, siVite,
  siNodedotjs, siFastapi, siGraphql, siDjango, siSpring,
  siDocker, siKubernetes, siTerraform, siVercel, siCloudflare, siGooglecloud, siNginx, siGithubactions,
  siPostgresql, siRedis, siMongodb, siSqlite, siSupabase, siPrisma, siElasticsearch,
  siAnthropic, siHuggingface, siPytorch, siLangchain, siOllama,
  siGit, siLinux, siNeovim, siFigma, siPostman, siGithub,
} from "simple-icons";

/**
 * STACK — the filing cabinet at /stack.
 * This is a SAMPLE list of common tools so the cabinet isn't empty.
 * Keep the ones you actually use, delete the rest, and set honest levels.
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
    id: "backend",
    label: "Backend",
    code: "A-01",
    color: "#FFD84D",
    description: "[SAMPLE] Services, APIs and the plumbing nobody sees.",
    skills: [
      s("Node.js", siNodedotjs, "daily", "[SAMPLE] What you build with it."),
      s("FastAPI", siFastapi, "comfortable", "[SAMPLE] What you build with it."),
      s("GraphQL", siGraphql, "comfortable", "[SAMPLE] What you build with it."),
      s("Django", siDjango, "learning", "[SAMPLE] What you build with it."),
      s("Spring", siSpring, "learning", "[SAMPLE] What you build with it."),
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    code: "A-02",
    color: "#FF755E",
    description: "[SAMPLE] Interfaces, interactions and pixels that behave.",
    skills: [
      s("React", siReact, "daily", "[SAMPLE] What you build with it."),
      s("Next.js", siNextdotjs, "daily", "[SAMPLE] What you build with it."),
      s("Tailwind CSS", siTailwindcss, "daily", "[SAMPLE] What you build with it."),
      s("Three.js", siThreedotjs, "comfortable", "[SAMPLE] What you build with it."),
      s("Vite", siVite, "comfortable", "[SAMPLE] What you build with it."),
    ],
  },
  {
    id: "cloud",
    label: "Cloud & Infra",
    code: "B-01",
    color: "#477BFF",
    description: "[SAMPLE] Where the code lives once it leaves my laptop.",
    skills: [
      s("Docker", siDocker, "daily", "[SAMPLE] How you use it."),
      s("Kubernetes", siKubernetes, "comfortable", "[SAMPLE] How you use it."),
      s("Terraform", siTerraform, "learning", "[SAMPLE] How you use it."),
      s("Google Cloud", siGooglecloud, "comfortable", "[SAMPLE] How you use it."),
      s("Cloudflare", siCloudflare, "comfortable", "[SAMPLE] How you use it."),
      s("Vercel", siVercel, "daily", "[SAMPLE] How you use it."),
      s("Nginx", siNginx, "comfortable", "[SAMPLE] How you use it."),
      s("GitHub Actions", siGithubactions, "daily", "[SAMPLE] How you use it."),
    ],
  },
  {
    id: "databases",
    label: "Databases",
    code: "B-02",
    color: "#9DDC8B",
    description: "[SAMPLE] Places where data sleeps (and sometimes wakes up angry).",
    skills: [
      s("PostgreSQL", siPostgresql, "daily", "[SAMPLE] How you use it."),
      s("Redis", siRedis, "comfortable", "[SAMPLE] How you use it."),
      s("MongoDB", siMongodb, "comfortable", "[SAMPLE] How you use it."),
      s("SQLite", siSqlite, "comfortable", "[SAMPLE] How you use it."),
      s("Supabase", siSupabase, "comfortable", "[SAMPLE] How you use it."),
      s("Prisma", siPrisma, "comfortable", "[SAMPLE] How you use it."),
      s("Elasticsearch", siElasticsearch, "learning", "[SAMPLE] How you use it."),
    ],
  },
  {
    id: "ai",
    label: "AI & LLMs",
    code: "C-01",
    color: "#F5EBD8",
    description: "[SAMPLE] Models, prompts, evals and the glue between them.",
    skills: [
      s("Claude API", siAnthropic, "comfortable", "[SAMPLE] How you use it."),
      s("Hugging Face", siHuggingface, "comfortable", "[SAMPLE] How you use it."),
      s("PyTorch", siPytorch, "learning", "[SAMPLE] How you use it."),
      s("LangChain", siLangchain, "learning", "[SAMPLE] How you use it."),
      s("Ollama", siOllama, "comfortable", "[SAMPLE] How you use it."),
      s("RAG pipelines", undefined, "comfortable", "[SAMPLE] How you use it."),
    ],
  },
  {
    id: "tools",
    label: "Dev Tools",
    code: "C-02",
    color: "#FFFFFF",
    description: "[SAMPLE] The everyday kit on the desk.",
    skills: [
      s("Git", siGit, "daily", "[SAMPLE] How you use it."),
      s("GitHub", siGithub, "daily", "[SAMPLE] How you use it."),
      s("Linux", siLinux, "daily", "[SAMPLE] How you use it."),
      s("Neovim", siNeovim, "comfortable", "[SAMPLE] How you use it."),
      s("Figma", siFigma, "comfortable", "[SAMPLE] How you use it."),
      s("Postman", siPostman, "comfortable", "[SAMPLE] How you use it."),
    ],
  },
  {
    id: "languages",
    label: "Languages",
    code: "D-01",
    color: "#FFD84D",
    description: "[SAMPLE] The words I think in.",
    skills: [
      s("TypeScript", siTypescript, "daily", "[SAMPLE] Where you reach for it."),
      s("JavaScript", siJavascript, "daily", "[SAMPLE] Where you reach for it."),
      s("Python", siPython, "daily", "[SAMPLE] Where you reach for it."),
      s("Go", siGo, "comfortable", "[SAMPLE] Where you reach for it."),
      s("Rust", siRust, "learning", "[SAMPLE] Where you reach for it."),
      s("C++", siCplusplus, "comfortable", "[SAMPLE] Where you reach for it."),
      s("Kotlin", siKotlin, "learning", "[SAMPLE] Where you reach for it."),
    ],
  },
];

export const allSkills = drawers.flatMap((d) => d.skills.map((sk) => ({ ...sk, drawer: d.label })));
