import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/today",
        "/statistics",
        "/subscription",
        "/terms",
        "/privacy",
        "/responsible-play",
        "/contact",
      ],
      disallow: [
        "/api/",
        "/account",
        "/paid-picks",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: "https://theunderoverclub.com/sitemap.xml",
    host: "https://theunderoverclub.com",
  };
}
