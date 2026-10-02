import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(
  "Football Picks Results & ROI",
  "Track free and paid football picks with transparent ROI, units profit, published odds, settled picks and pending results by market.",
  "/statistics",
);

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
