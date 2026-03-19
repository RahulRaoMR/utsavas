import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UTSAVAS",
    short_name: "UTSAVAS",
    description:
      "Discover wedding halls, banquet halls, party venues, and event-ready spaces with UTSAVAS.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4ecdf",
    theme_color: "#3f6fb6",
    orientation: "portrait-primary",
    lang: "en-IN",
    categories: ["events", "lifestyle", "travel"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
