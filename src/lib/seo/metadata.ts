import type { Metadata } from "next";
export const SITE_URL = "https://www.theunderoverclub.com";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_GB", siteName: "The Under Over Club", title, description, url: path,
      images: [{ url: "/opengraph-image.png", alt: "The Under Over Club — Stats. Goals. Profit. In that order." }] },
    twitter: { card: "summary_large_image", title, description, images: ["/twitter-image.png"] },
  };
}
