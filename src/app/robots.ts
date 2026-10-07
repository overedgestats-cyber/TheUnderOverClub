import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/today",
        "/about",
        "/guides",
        "/guides/",
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
    sitemap: "https://www.theunderoverclub.com/sitemap.xml",
    host: "https://www.theunderoverclub.com",
  };
}
