import type { MetadataRoute } from "next";
import connectDB from "../lib/mongodb";
import Hall from "../models/Hall";
import { SITE_URL } from "../lib/seo";
import { getVenueRoute, VENUE_TYPE_OPTIONS } from "../lib/venueCategories";
import { SEO_LANDING_PAGES } from "../lib/seoLandingPages";

type SitemapHall = {
  _id: string;
  category?: string;
  updatedAt?: string | Date;
};

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/wedding-halls", priority: 0.95, changeFrequency: "daily" as const },
  { path: "/banquet-halls", priority: 0.92, changeFrequency: "daily" as const },
  { path: "/party-venues", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/about-us", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.72, changeFrequency: "monthly" as const },
  { path: "/why-utsavas", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/venue-stories", priority: 0.68, changeFrequency: "weekly" as const },
  { path: "/faqs", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.62, changeFrequency: "monthly" as const },
  { path: "/halls", priority: 0.7, changeFrequency: "weekly" as const },
];

function buildAbsoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: buildAbsoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = [...new Set(
    VENUE_TYPE_OPTIONS.map((category) => category.route)
  )].map((route) => ({
    url: buildAbsoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.88,
  }));

  const landingEntries: MetadataRoute.Sitemap = SEO_LANDING_PAGES.map((page) => ({
    url: buildAbsoluteUrl(`/${page.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  try {
    await connectDB();

    const halls = await Hall.find({ status: "approved" })
      .select("_id category updatedAt")
      .lean();

    const hallEntries: MetadataRoute.Sitemap = (halls as SitemapHall[]).map((hall) => ({
      url: buildAbsoluteUrl(`${getVenueRoute(hall.category)}/${hall._id}`),
      lastModified: hall.updatedAt ? new Date(hall.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.84,
    }));

    return [...staticEntries, ...categoryEntries, ...landingEntries, ...hallEntries];
  } catch (error) {
    console.error("SITEMAP GENERATION ERROR", error);
    return [...staticEntries, ...categoryEntries, ...landingEntries];
  }
}
