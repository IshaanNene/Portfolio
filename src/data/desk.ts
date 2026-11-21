import { site } from "@/config/site";

export type DeskObjectId = "coffee" | "headphones" | "notebook" | "pens" | "photo1" | "photo2" | "plant" | "laptop";

/** Objects on the /about desk. Text comes from `site.desk` in the config. */
export const deskObjects: { id: DeskObjectId; label: string; text: string; color: string }[] = [
  { id: "laptop", label: "Laptop", text: site.desk.laptop, color: "#d7d9dc" },
  { id: "coffee", label: "Coffee mug", text: site.desk.coffee, color: "#3E5C76" },
  { id: "headphones", label: "Headphones", text: site.desk.headphones, color: "#D2693A" },
  { id: "notebook", label: "Notebook", text: site.desk.notebook, color: "#D9A441" },
  { id: "pens", label: "Pen cup", text: site.desk.pens, color: "#D9A441" },
  { id: "photo1", label: "Photo #1", text: site.desk.photo1, color: "#FFFFFF" },
  { id: "photo2", label: "Photo #2", text: site.desk.photo2, color: "#FFFFFF" },
  { id: "plant", label: "Plant", text: site.desk.plant, color: "#8FA05A" },
];
