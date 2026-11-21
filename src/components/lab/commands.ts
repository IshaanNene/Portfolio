import { navItems } from "@/config/nav";
import { site } from "@/config/site";
import { experience } from "@/data/experience";
import { projects, statusLabel } from "@/data/projects";
import { drawers, levelLabel } from "@/data/skills";
import { EGGS, type EggId } from "@/lib/eggs";

export type Tone = "out" | "muted" | "accent" | "error" | "ok" | "warn";
export type OutLine = { text: string; tone?: Tone; href?: string };

export type Effects = {
  clear?: boolean;
  navigate?: string;
  egg?: EggId;
  theme?: boolean;
  matrix?: boolean;
  unlock?: boolean;
  sound?: boolean | null;
};

export type Ctx = { history: string[]; eggsFound: EggId[] };

const strip = (s: string) => s.replace(/\[PLACEHOLDER\]\s*|\[SAMPLE\]\s*|SAMPLE — /g, "");
const L = (text: string, tone: Tone = "out", href?: string): OutLine => ({ text, tone, href });

export const COMMANDS: Record<string, string> = {
  help: "list commands",
  about: "who is this person",
  projects: "list projects (try: project <slug>)",
  project: "open a project's case file",
  skills: "the filing cabinet (try: skills frontend)",
  experience: "print the receipt",
  contact: "how to reach me",
  socials: "links elsewhere",
  ls: "list diary pages",
  open: "go to a page (open now)",
  whoami: "who are YOU",
  date: "local time where I am",
  echo: "say something back",
  history: "commands you've typed",
  theme: "toggle green / amber phosphor",
  sound: "sound on | off",
  eggs: "easter-egg progress",
  matrix: "follow the white rabbit",
  clear: "wipe the screen",
};

export function banner(): OutLine[] {
  const name = `${site.firstName.toLowerCase()}-os`;
  return [
    L(`*** ${name} v1.0 · diary terminal ***`, "accent"),
    L(`last login: just now from your browser`, "muted"),
    L("type 'help' to see what I can do. tab completes. ↑↓ for history.", "muted"),
  ];
}

export function run(raw: string, ctx: Ctx): { lines: OutLine[]; fx?: Effects } {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmdRaw, ...args] = input.split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const arg = args.join(" ");

  switch (cmd) {
    case "help":
      return {
        lines: [
          L("available commands:", "accent"),
          ...Object.entries(COMMANDS).map(([k, v]) => L(`  ${k.padEnd(11)} ${v}`)),
          L("…and a few that aren't listed.", "muted"),
        ],
      };
    case "about":
    case "cat":
      if (cmd === "cat" && arg && !arg.includes("about")) return { lines: [L(`cat: ${arg}: no such file. try 'cat about.txt'`, "error")] };
      return {
        lines: [
          L(`${site.name} — ${strip(site.role)}`, "accent"),
          L(`based in ${site.location}`, "muted"),
          ...site.intro.map((p) => L(strip(p))),
          L("→ more at /about", "muted", "/about"),
        ],
      };
    case "projects":
      return {
        lines: [
          L(`${projects.length} projects found:`, "accent"),
          ...projects.map((p) => L(`  ${p.slug.padEnd(24)} [${statusLabel[p.status]}] ${p.stack.slice(0, 3).join(", ")}`, "out", `/projects/${p.slug}`)),
          L("tip: 'project <slug>' opens a case file", "muted"),
        ],
      };
    case "project": {
      const p = projects.find((x) => x.slug === arg || x.slug.includes(arg));
      if (!arg || !p) return { lines: [L(`project: '${arg || "?"}' not found. try 'projects'`, "error")] };
      return { lines: [L(`opening case file: ${p.name}…`, "ok")], fx: { navigate: `/projects/${p.slug}` } };
    }
    case "skills":
    case "stack": {
      const d = arg ? drawers.find((x) => x.id === arg.toLowerCase() || x.label.toLowerCase().startsWith(arg.toLowerCase())) : null;
      if (arg && !d) return { lines: [L(`no drawer '${arg}'. drawers: ${drawers.map((x) => x.id).join(", ")}`, "error")] };
      if (d)
        return {
          lines: [L(`drawer ${d.code} — ${d.label}`, "accent"), ...d.skills.map((s) => L(`  ${s.name.padEnd(16)} ${levelLabel[s.level]}`))],
        };
      return {
        lines: [
          L("filing cabinet contents:", "accent"),
          ...drawers.map((x) => L(`  [${x.code}] ${x.label.padEnd(14)} ${x.skills.map((s) => s.name).slice(0, 4).join(", ")}…`)),
          L("tip: 'skills <drawer>' · full cabinet at /stack", "muted", "/stack"),
        ],
      };
    }
    case "experience":
    case "work":
      return {
        lines: [
          L("printing receipt…", "muted"),
          ...experience.flatMap((e) => [L(`■ ${e.role} @ ${e.company}`, "accent"), L(`  ${e.start} → ${e.end}`, "muted")]),
          L("→ full receipt at /experience", "muted", "/experience"),
        ],
      };
    case "contact":
    case "email":
      return {
        lines: [
          L(`email     ${site.contact.email}`, "accent", `mailto:${site.contact.email}`),
          L(`github    ${site.socials.github}`, "out", site.socials.github),
          L(`linkedin  ${site.socials.linkedin}`, "out", site.socials.linkedin),
          L("or break the wax seal at /contact", "muted", "/contact"),
        ],
      };
    case "socials":
      return { lines: [L(`github    ${site.socials.github}`, "out", site.socials.github), L(`linkedin  ${site.socials.linkedin}`, "out", site.socials.linkedin)] };
    case "ls":
      return { lines: [L("cover/", "accent"), ...navItems.map((n) => L(`${n.label.toLowerCase()}/`.padEnd(14) + n.blurb, "out", n.href))] };
    case "cd":
    case "open":
    case "goto": {
      const target = arg.replace(/^\/|\/$/g, "").toLowerCase();
      if (["", "~", "cover", "home", ".."].includes(target)) return { lines: [L("flipping to the cover…", "ok")], fx: { navigate: "/" } };
      if (target === "back-page") return { lines: [L("how did you know about that?", "warn")], fx: { navigate: "/back-page" } };
      const n = navItems.find((x) => x.label.toLowerCase() === target || x.href === "/" + target);
      if (!n) return { lines: [L(`${cmd}: no such page: ${arg}`, "error")] };
      return { lines: [L(`flipping to ${n.label}…`, "ok")], fx: { navigate: n.href } };
    }
    case "whoami":
      return { lines: [L("a curious visitor with excellent taste in portfolios.", "accent"), L(`(${typeof navigator !== "undefined" ? navigator.language : "en"} · ${typeof window !== "undefined" ? window.innerWidth + "px wide" : ""})`, "muted")] };
    case "date":
    case "time":
      return {
        lines: [
          L(new Date().toLocaleString("en-GB", { timeZone: site.timezone, dateStyle: "full", timeStyle: "short" }) + ` (${site.timezone})`, "accent"),
        ],
      };
    case "echo":
      return { lines: [L(arg || "")] };
    case "history":
      return { lines: ctx.history.length ? ctx.history.map((h, i) => L(`  ${String(i + 1).padStart(3)}  ${h}`)) : [L("no history yet.", "muted")] };
    case "theme":
      return { lines: [L("phosphor swapped.", "ok")], fx: { theme: true } };
    case "sound":
      if (arg === "on" || arg === "off") return { lines: [L(`sound ${arg}.`, "ok")], fx: { sound: arg === "on" } };
      return { lines: [L("usage: sound on | off", "muted")] };
    case "eggs": {
      const all = Object.keys(EGGS) as EggId[];
      return {
        lines: [
          L(`easter eggs: ${ctx.eggsFound.length}/${all.length}`, "accent"),
          ...all.map((id) => L(`  ${ctx.eggsFound.includes(id) ? "[x]" : "[ ]"} ${ctx.eggsFound.includes(id) ? EGGS[id].name : "???"}`, ctx.eggsFound.includes(id) ? "ok" : "muted")),
        ],
      };
    }
    case "matrix":
      return { lines: [L("wake up…", "ok")], fx: { matrix: true } };
    case "clear":
    case "cls":
      return { lines: [], fx: { clear: true } };
    case "banner":
      return { lines: banner() };
    // ── unlisted ──
    case "sudo":
      if (/rm\s+-rf/.test(arg)) return { lines: [L("nice try. the diary is laminated.", "warn")] };
      return {
        lines: [L(`[sudo] password for visitor: ********`, "muted"), L("access granted. you found root access ★", "ok"), L("hint: there's a command called 'secret'", "muted")],
        fx: { egg: "terminal" },
      };
    case "rm":
      return { lines: [L("rm: cannot remove: this is a diary, not a filesystem", "error")] };
    case "secret":
      return {
        lines: [L("the back page exists. it was never bound in.", "accent"), L("opening it…", "ok")],
        fx: { egg: "terminal", navigate: "/back-page" },
      };
    case "unlock":
      return { lines: [L("CLEARANCE GRANTED. the classified folder is open ↓", "ok")], fx: { unlock: true, egg: "classified" } };
    case "coffee":
      return { lines: [L("    ( (", "muted"), L("     ) )", "muted"), L("  ........", "accent"), L("  |      |]", "accent"), L("  \\      /", "accent"), L("   `----'", "accent"), L("brewing… (try typing 'coffee' outside the terminal too)", "muted")] };
    case "hello":
    case "hi":
      return { lines: [L(`hi! 👋 i'm ${site.firstName}'s terminal. type 'help'.`, "accent")] };
    case "exit":
      return { lines: [L("there is no escape. (but the bookmarks on the right work.)", "warn")] };
    case "vim":
    case "nvim":
      return { lines: [L("you are now trapped in vim. just kidding. :q!", "warn")] };
    case "42":
      return { lines: [L("the answer. but what was the question?", "accent")] };
    default:
      return { lines: [L(`command not found: ${cmd}. type 'help'.`, "error")] };
  }
}

export const completions = [...Object.keys(COMMANDS), "project", "sudo", "secret", "coffee", "unlock"];
