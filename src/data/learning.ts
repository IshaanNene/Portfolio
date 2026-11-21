/**
 * LEARNING — the to-do notebook at /learning.
 * `done` is the default state;
 * visitors can tick boxes and it's remembered in their browser only.
 */

export type LearningGroup = "completed" | "exploring" | "future";

export type LearningItem = {
  id: string;
  group: LearningGroup;
  title: string;
  note: string;
  done: boolean;
  resource?: { label: string; href: string };
};

export const groupMeta: Record<LearningGroup, { label: string; scrawl: string }> = {
  completed: { label: "Done & dusted", scrawl: "proof I finish things" },
  exploring: { label: "Exploring now", scrawl: "currently on the desk" },
  future: { label: "Someday / maybe", scrawl: "the wishlist" },
};

export const learningItems: LearningItem[] = [
  { id: "l1", group: "completed", title: "Raft, from the inside", note: "Chronoscope: a Raft-replicated log that a seeded simulator broke 18 ways. 16 fixed, each with a regression test.", done: true, resource: { label: "ChronoScope", href: "https://github.com/IshaanNene/ChronoScope" } },
  { id: "l2", group: "completed", title: "Erlang/OTP", note: "One supervised gen_server per live chess game, owning clocks and reconnects.", done: true, resource: { label: "Alekhine's Counter-Gambit", href: "https://github.com/IshaanNene/AlekhinesCounter-Gambit" } },
  { id: "l3", group: "completed", title: "IBM z/OS", note: "IBM courses on z/OS and IBM Z, then reading program libraries through JZOS at work.", done: true },
  { id: "l4", group: "exploring", title: "Agents that are safe to run", note: "Fixed graphs, policy gates and no-network sandboxes — DebugAssist and Faultline.", done: false, resource: { label: "DebugAssist", href: "https://github.com/IshaanNene/DebugAssist" } },
  { id: "l5", group: "exploring", title: "Model Context Protocol", note: "ScrapeGoat ships an MCP server; DebugAssist talks to eleven of them.", done: false, resource: { label: "ScrapeGoat", href: "https://github.com/IshaanNene/ScrapeGoat" } },
  { id: "l6", group: "exploring", title: "Kafka operations", note: "kaas: inspect a cluster, change it safely and move data through it.", done: false, resource: { label: "kaas", href: "https://github.com/IshaanNene/Kafka-as-a-Service" } },
  { id: "l7", group: "future", title: "Meridian on a real cloud cluster", note: "Helm, Argo CD and Terraform exist; nothing has been applied to the cloud yet.", done: false },
  { id: "l8", group: "future", title: "Measure DebugAssist's decision layer", note: "Every recorded call fell back to the LLM decider, so it isn't measured yet.", done: false },
  { id: "l9", group: "future", title: "Chess fan-out on Redis", note: "So live games survive more than one gateway replica.", done: false },
];
