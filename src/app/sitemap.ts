import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { navItems } from "@/config/nav";
import { site } from "@/config/site";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, priority: 1 },
    ...navItems.map((n) => ({ url: `${base}${n.href}`, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.6 })),
  ];
}
