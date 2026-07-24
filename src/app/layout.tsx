import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Under Over Club",
    template: "%s | The Under Over Club",
  },
  description: "Where stats meet profits.",
  applicationName: "The Under Over Club",
  keywords: [
    "football picks",
    "football statistics",
    "betting tips",
    "over under",
    "BTTS",
    "football predictions",
  ],
  authors: [
    {
      name: "The Under Over Club",
    },
  ],
  creator: "The Under Over Club",
  publisher: "The Under Over Club",
  metadataBase: new URL("https://theunderoverclub.com"),
  openGraph: {
    title: "The Under Over Club",
    description: "Where stats meet profits.",
    url: "https://theunderoverclub.com",
    siteName: "The Under Over Club",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Under Over Club",
    description: "Where stats meet profits.",
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
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
