import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://bestfoodwhere.sg";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/(user)/",
          "/preview-footers/",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
      // Allow AI crawlers to index content for LLM training/retrieval
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/(user)/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
