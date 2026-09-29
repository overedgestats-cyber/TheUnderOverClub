import type { MetadataRoute } from "next";

const baseUrl = "https://www.theunderoverclub.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/today",
    "/paid-picks",
    "/statistics",
    "/game",
    "/subscription",
    "/about",
    "/responsible-play",
    "/terms",
    "/privacy",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "/today" || route === "/paid-picks"
        ? "daily"
        : route === "/statistics"
          ? "daily"
          : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/today" || route === "/statistics"
          ? 0.9
          : 0.7,
  }));
}
