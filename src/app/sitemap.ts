import type { MetadataRoute } from "next";

import { guideArticles } from "@/lib/guides/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.theunderoverclub.com";

  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${base}/guides`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...guideArticles.map((article) => ({
      url: `${base}/guides/${article.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/today`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/statistics`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${base}/stats/over-2-5-leagues`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${base}/subscription`, changeFrequency: "monthly", priority: 0.8 },
    ...guidePages,
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/game`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.4 },
    {
      url: `${base}/responsible-play`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
