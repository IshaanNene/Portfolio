import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/back-page" },
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
