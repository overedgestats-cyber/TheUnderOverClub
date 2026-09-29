import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

import RetroShell from "@/components/retro/RetroShell";

const siteName = "The Under Over Club";
const siteUrl = "https://www.theunderoverclub.com";
const gaMeasurementId = "G-ECB5B84FW8";

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
          <RetroShell>{children}</RetroShell>
        </ClerkProvider>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ECB5B84FW8');
          `}
        </Script>

        <Analytics />
      </body>
    </html>
  );
}
