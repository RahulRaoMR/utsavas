import mongoose from "mongoose";
import connectDB from "./mongodb";
import { getApiBaseUrl } from "./api";
import Hall from "../models/Hall";
import { toAbsoluteImageUrl } from "./imageUrl";
import { getVenueCategoryLabel } from "./venueCategories";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_E164,
} from "./siteContact";

export const SITE_NAME = "UTSAVAS";
export const SITE_URL = "https://www.utsavas.com";
export const DEFAULT_SEO_IMAGE = "/seo/utsavas-search-share-v1.png";
export const DEFAULT_SEO_DESCRIPTION =
  "UTSAVAS helps you discover and book wedding halls, banquet halls, marriage halls, party venues, resorts, and premium event spaces across Bangalore and Karnataka.";
export const DEFAULT_SEO_TITLE =
  "UTSAVAS - Book Wedding Venues in Bangalore | Banquet Halls & Marriage Halls";
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION ||
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  "";

export const DEFAULT_SEO_KEYWORDS = [
  "utsavas",
  "utsavas.com",
  "wedding halls Bangalore",
  "banquet halls Bangalore",
  "marriage halls Bangalore",
  "venue booking Bangalore",
  "party venues Bangalore",
  "premium venues Karnataka",
  "wedding venues Karnataka",
  "banquet halls near me",
];

const MONGODB_URI = process.env.MONGODB_URI;

function normalizePath(pathname = "/") {
  const normalized = String(pathname || "/").trim();

  if (!normalized || normalized === "/") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function dedupeKeywords(...groups) {
  return [...new Set(groups.flat().filter(Boolean).map((value) => String(value).trim()))];
}

function truncateText(value, maxLength = 160) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function formatVenueAddress(hall = {}) {
  return [
    hall?.address?.area,
    hall?.address?.city,
    hall?.address?.state,
    hall?.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildVenuePriceLabel(hall = {}) {
  const pricePerEvent = Number(hall?.pricePerEvent) || 0;
  const pricePerDay = Number(hall?.pricePerDay) || 0;
  const pricePerPlate = Number(hall?.pricePerPlate) || 0;

  if (pricePerEvent > 0) {
    return `from Rs ${pricePerEvent.toLocaleString("en-IN")} per event`;
  }

  if (pricePerDay > 0) {
    return `from Rs ${pricePerDay.toLocaleString("en-IN")} per day`;
  }

  if (pricePerPlate > 0) {
    return `from Rs ${pricePerPlate.toLocaleString("en-IN")} per plate`;
  }

  return "with verified venue details on UTSAVAS";
}

function buildHallDescription(hall = {}) {
  const categoryLabel = getVenueCategoryLabel(hall?.category) || "venue";
  const city = hall?.address?.city || "Bangalore";
  const address = formatVenueAddress(hall);
  const about = truncateText(hall?.about, 140);
  const priceLabel = buildVenuePriceLabel(hall);

  if (about) {
    return truncateText(
      `${hall?.hallName || "This venue"} is a ${categoryLabel.toLowerCase()} in ${city}. ${about}`,
      160
    );
  }

  return truncateText(
    `Explore ${hall?.hallName || "this venue"}${address ? ` in ${address}` : ""}. Check photos, capacity, amenities, and pricing ${priceLabel} on UTSAVAS.`,
    160
  );
}

export function buildAbsoluteUrl(pathname = "/") {
  const path = normalizePath(pathname);
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

function resolveImageUrl(imagePath = DEFAULT_SEO_IMAGE) {
  if (!imagePath) {
    return buildAbsoluteUrl(DEFAULT_SEO_IMAGE);
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return buildAbsoluteUrl(imagePath);
}

export function buildMetadata({
  title = DEFAULT_SEO_TITLE,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  keywords = [],
  image = DEFAULT_SEO_IMAGE,
  type = "website",
  noIndex = false,
} = {}) {
  const canonicalPath = normalizePath(path);
  const imageUrl = resolveImageUrl(image);

  return {
    title,
    description,
    keywords: dedupeKeywords(DEFAULT_SEO_KEYWORDS, keywords),
    category: "venue booking",
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type,
      url: buildAbsoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      locale: "en_IN",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function buildCategoryMetadata({
  title,
  route,
  description,
  keywords = [],
} = {}) {
  const categoryTitle = title || "Wedding Venues";
  const categoryDescription =
    description ||
    `Browse ${categoryTitle.toLowerCase()} in Bangalore and across Karnataka on UTSAVAS. Compare pricing, photos, location, capacity, and verified venue details before booking.`;

  return buildMetadata({
    title: `${categoryTitle} in Bangalore | UTSAVAS`,
    description: categoryDescription,
    path: route || "/wedding-halls",
    keywords: [
      `${categoryTitle} Bangalore`,
      `${categoryTitle} Karnataka`,
      `best ${categoryTitle.toLowerCase()} in Bangalore`,
      ...keywords,
    ],
  });
}

export function buildHomeMetadata() {
  return buildMetadata({
    title: DEFAULT_SEO_TITLE,
    description:
      "Find and book the best wedding halls, banquet halls, marriage halls, and party venues in Bangalore and across Karnataka with UTSAVAS.",
    path: "/",
    keywords: [
      "book wedding venues Bangalore",
      "marriage halls Karnataka",
      "venue booking platform India",
    ],
  });
}

export async function getApprovedHallById(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
    return null;
  }

  if (!MONGODB_URI) {
    return getApprovedHallByIdFromApi(id);
  }

  try {
    await connectDB();

    const hall = await Hall.findOne({
      _id: id,
      status: "approved",
    }).lean();

    if (!hall) {
      return null;
    }

    return JSON.parse(JSON.stringify(hall));
  } catch (error) {
    console.error("FAILED TO LOAD APPROVED HALL FROM MONGODB", error);
    return getApprovedHallByIdFromApi(id);
  }
}

async function getApprovedHallByIdFromApi(id) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/halls/${id}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const hall = await response.json();

    if (hall?.status !== "approved") {
      return null;
    }

    return hall;
  } catch (error) {
    console.error("FAILED TO LOAD APPROVED HALL FROM API", error);
    return null;
  }
}

export function buildHallMetadata(hall, path) {
  if (!hall) {
    return buildMetadata({
      title: "Venue not found | UTSAVAS",
      description:
        "This venue is unavailable right now. Explore more wedding halls, banquet halls, and party venues on UTSAVAS.",
      path,
      noIndex: true,
    });
  }

  const city = hall?.address?.city || "Bangalore";
  const categoryLabel = getVenueCategoryLabel(hall?.category) || "Venue";
  const image = hall?.images?.[0]
    ? toAbsoluteImageUrl(hall.images[0])
    : DEFAULT_SEO_IMAGE;

  return buildMetadata({
    title: `${hall.hallName} in ${city} | ${categoryLabel} | UTSAVAS`,
    description: buildHallDescription(hall),
    path,
    image,
    type: "article",
    keywords: [
      hall.hallName,
      `${hall.hallName} ${city}`,
      `${categoryLabel} ${city}`,
      `${categoryLabel} Karnataka`,
      hall?.address?.area ? `${categoryLabel} ${hall.address.area}` : "",
    ],
  });
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: buildAbsoluteUrl("/pwa/icon-512-v3.png"),
    image: buildAbsoluteUrl(DEFAULT_SEO_IMAGE),
    description: DEFAULT_SEO_DESCRIPTION,
    areaServed: "Karnataka, India",
    email: SUPPORT_EMAIL,
    telephone: SUPPORT_PHONE_DISPLAY,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SUPPORT_PHONE_E164,
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        areaServed: "IN",
        availableLanguage: ["English", "Kannada", "Hindi"],
      },
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    image: buildAbsoluteUrl(DEFAULT_SEO_IMAGE),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/wedding-halls?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: DEFAULT_SEO_TITLE,
    url: SITE_URL,
    description:
      "Browse wedding halls, banquet halls, premium venues, and party venues in Bangalore and across Karnataka with UTSAVAS.",
  };
}

export function buildHallJsonLd(hall, path) {
  if (!hall) {
    return null;
  }

  const image = hall?.images?.[0]
    ? toAbsoluteImageUrl(hall.images[0])
    : buildAbsoluteUrl(DEFAULT_SEO_IMAGE);
  const address = hall?.address || {};
  const priceRange = buildVenuePriceLabel(hall).replace(/^from\s+/i, "");

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: hall.hallName,
    url: buildAbsoluteUrl(path),
    image,
    description: buildHallDescription(hall),
    address: {
      "@type": "PostalAddress",
      streetAddress: [address.flat, address.floor, address.area]
        .filter(Boolean)
        .join(", "),
      addressLocality: address.city || "",
      addressRegion: address.state || "Karnataka",
      postalCode: address.pincode || "",
      addressCountry: "IN",
    },
    areaServed: address.city || "Bangalore",
    priceRange,
  };
}
