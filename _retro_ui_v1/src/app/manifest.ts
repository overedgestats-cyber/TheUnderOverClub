import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Under Over Club",
    short_name: "Under Over Club",
    description:
      "Daily football picks and transparent performance statistics.",
    start_url: "/",
    display: "standalone",
    background_color: "#020304",
    theme_color: "#05070a",
  };
}
