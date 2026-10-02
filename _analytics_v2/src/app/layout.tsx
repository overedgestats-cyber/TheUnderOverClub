import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

import "./globals.css";

const siteName = "The Under Over Club";
const siteUrl = "https://theunderoverclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "The Under Over Club | Football Picks & Statistics",
    template: "%s | The Under Over Club",
  },
  description:
    "Daily football predictions with two free O/U 2.5 picks, members-only value picks, and transparent real-result performance statistics.",
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName,
    title: "The Under Over Club",
    description:
      "Stats. Goals. Profit. Two free O/U 2.5 picks every day plus a members-only published value board.",
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
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
