import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://kanban.isdevs.cv";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/$",
        "/privacy$",
        "/terms$",
        "/_next/",
        "/favicon.ico",
        "/opengraph-image",
        "/twitter-image",
      ],
      disallow: ["/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
