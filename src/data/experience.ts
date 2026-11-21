/**
 * EXPERIENCE — printed on the receipt at /experience.
 * Every entry below is a PLACEHOLDER. Replace with your real history;
 * delete entries you don't need. Nothing here is real.
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
    id: "exp-1",
    role: "[Job Title]",
    company: "[Company Name]",
    location: "[City / Remote]",
    start: "[MMM YYYY]",
    end: "Present",
    type: "full-time",
    responsibilities: [
      "[Responsibility — what you owned day to day]",
      "[Responsibility — systems or teams you worked with]",
      "[Responsibility — process you improved]",
    ],
    achievements: ["[Achievement — something you shipped or led]"],
    impact: "[Technical impact — describe the change you made, with real numbers only if you have them]",
    stack: ["[Tech]", "[Tech]", "[Tech]"],
    placeholder: true,
  },
  {
    id: "exp-2",
    role: "[Job Title]",
    company: "[Company Name]",
    location: "[City / Remote]",
    start: "[MMM YYYY]",
    end: "[MMM YYYY]",
    type: "internship",
    responsibilities: ["[Responsibility]", "[Responsibility]"],
    achievements: ["[Achievement]"],
    impact: "[Technical impact]",
    stack: ["[Tech]", "[Tech]"],
    placeholder: true,
  },
  {
    id: "exp-3",
    role: "[Degree / Programme]",
    company: "[University / School]",
    start: "[YYYY]",
    end: "[YYYY]",
    type: "education",
    responsibilities: ["[Focus area or coursework]", "[Clubs, societies, teaching]"],
    achievements: ["[Award, project or thesis]"],
    impact: "[What it gave you]",
    stack: ["[Topic]", "[Topic]"],
    placeholder: true,
  },
];

/** Career milestones that print as "special" lines on the receipt. */
export const careerMilestones: { label: string; date: string }[] = [
  { label: "[First line of code]", date: "[YYYY]" },
  { label: "[First production deploy]", date: "[YYYY]" },
  { label: "[A milestone you're proud of]", date: "[YYYY]" },
];
