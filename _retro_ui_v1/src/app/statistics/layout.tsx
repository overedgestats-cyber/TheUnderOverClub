import type { Metadata } from "next";
import RetroShell from "@/components/retro/RetroShell";

export const metadata: Metadata = {
  title: "Football Pick Statistics",
  description:
    "Transparent win rate, units, ROI and settled-pick statistics from The Under Over Club.",
  alternates: { canonical: "/statistics" },
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RetroShell>{children}</RetroShell>;
}
