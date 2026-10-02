import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import RetroShell from "@/components/retro/RetroShell";
const siteName = "The Under Over Club";
const siteUrl = "https://www.theunderoverclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "The Under Over Club | Football Picks & Statistics",
    template: "%s | The Under Over Club",
  },
  description:
    "Data-led football predictions, free Over/Under 2.5 picks when value qualifies, members-only picks, and transparent win rate and ROI statistics.",
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName,
    title: "The Under Over Club",
    description:
      "Stats. Goals. Profit. Free O/U 2.5 picks when value qualifies plus a members-only published value board.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Under Over Club",
    description:
      "Stats. Goals. Profit. Free daily football picks and a members-only value board.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider afterSignOutUrl="/">
          <AnalyticsProvider><RetroShell>{children}</RetroShell></AnalyticsProvider>
        </ClerkProvider>
          <Analytics />
      </body>
    </html>
  );
}
