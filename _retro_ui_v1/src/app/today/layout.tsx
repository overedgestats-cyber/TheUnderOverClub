import type { Metadata } from "next";
import RetroShell from "@/components/retro/RetroShell";

export const metadata: Metadata = {
  title: "Free Football Picks Today",
  description:
    "View today's two free O/U 2.5 football selections from The Under Over Club.",
  alternates: { canonical: "/today" },
};

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RetroShell>{children}</RetroShell>;
}
