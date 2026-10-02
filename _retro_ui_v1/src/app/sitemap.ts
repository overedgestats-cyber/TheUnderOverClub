import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://theunderoverclub.com";

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/today`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/statistics`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/subscription`, changeFrequency: "monthly", priority: 0.8 },
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
