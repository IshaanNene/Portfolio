export type NavItem = {
  href: string;
  label: string;
  page: string;
  color: "sun" | "electric" | "coral" | "grass" | "paper" | "cream" | "pink";
  blurb: string;
};

/** Order = order of the bookmark tabs. */
export const navItems: NavItem[] = [
  { href: "/now", label: "Now", page: "02", color: "sun", blurb: "what I'm up to this week" },
  { href: "/projects", label: "Projects", page: "03", color: "coral", blurb: "polaroids & case files" },
  { href: "/experience", label: "Experience", page: "04", color: "paper", blurb: "the long receipt" },
  { href: "/about", label: "About", page: "05", color: "grass", blurb: "my desk, my head" },
  { href: "/lab", label: "Lab", page: "06", color: "electric", blurb: "terminal & experiments" },
  { href: "/stack", label: "Stack", page: "07", color: "sun", blurb: "the filing cabinet" },
  { href: "/learning", label: "Learning", page: "08", color: "coral", blurb: "the to-do notebook" },
  { href: "/contact", label: "Contact", page: "09", color: "grass", blurb: "a sealed envelope" },
  { href: "/music", label: "Music", page: "10", color: "pink", blurb: "records, guitar & what's on" },
];

export const colorClass: Record<NavItem["color"], string> = {
  sun: "bg-sun",
  electric: "bg-electric text-paper",
  coral: "bg-coral",
  grass: "bg-grass",
  paper: "bg-paper",
  cream: "bg-cream",
  pink: "bg-[#B5835A]",
};
