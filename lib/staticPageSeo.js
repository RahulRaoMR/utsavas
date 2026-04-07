import { buildMetadata } from "./seo";

export const REQUIRED_FOOTER_PATHS = [
  "/why-utsavas",
  "/venue-stories",
  "/amenities",
  "/events",
  "/faqs",
  "/contact",
  "/privacy",
  "/security",
  "/terms",
  "/help",
  "/report-fraud",
  "/about",
];

const STATIC_PAGE_SEO = {
  "/why-utsavas": {
    title: "Why UTSAVAS | Premium Venue Booking Platform",
    description:
      "Discover why UTSAVAS is trusted for wedding venues, banquet halls, party venues, and premium event spaces across Bangalore and Karnataka.",
  },
  "/venue-stories": {
    title: "Venue Stories | UTSAVAS",
    description:
      "Explore venue stories, celebration ideas, and curated inspiration across wedding halls, banquet halls, resorts, lawns, and party venues.",
  },
  "/amenities": {
    title: "Amenities | UTSAVAS",
    description:
      "Explore venue amenities on UTSAVAS including parking, guest comfort, decor flexibility, dining support, and celebration-ready event infrastructure.",
  },
  "/events": {
    title: "Events | UTSAVAS",
    description:
      "Discover how UTSAVAS helps you compare venues, check event requirements, review amenities, and send booking requests with confidence.",
  },
  "/faqs": {
    title: "FAQs | UTSAVAS Help & Support",
    description:
      "Find answers about venue discovery, bookings, pricing, vendor listings, account access, and support on UTSAVAS.",
  },
  "/contact": {
    title: "Contact UTSAVAS | Book Event Venues",
    description:
      "Contact UTSAVAS for venue booking help, vendor support, customer assistance, and event-related enquiries in Bangalore and Karnataka.",
  },
  "/privacy": {
    title: "Privacy Policy | UTSAVAS",
    description:
      "Learn how UTSAVAS collects, uses, stores, and protects your personal information, booking data, and privacy preferences.",
  },
  "/security": {
    title: "Security | UTSAVAS",
    description:
      "Learn how UTSAVAS handles responsible security disclosures and how to report potential vulnerabilities or platform security concerns.",
  },
  "/terms": {
    title: "Terms of Service | UTSAVAS",
    description:
      "Read the UTSAVAS terms of service for platform access, bookings, third-party listings, user responsibilities, and legal conditions.",
  },
  "/help": {
    title: "Help & Support | UTSAVAS",
    description:
      "Get help from UTSAVAS for venue enquiries, bookings, vendor support, technical issues, payments, and general platform assistance.",
  },
  "/report-fraud": {
    title: "Report Fraud | UTSAVAS",
    description:
      "Report suspected fraud, impersonation, deceptive activity, or misuse related to UTSAVAS through the official reporting page.",
  },
  "/about": {
    title: "About UTSAVAS - Premium Event Venues in Bangalore",
    description:
      "Learn about UTSAVAS, a premium venue discovery and booking platform for weddings, celebrations, banquet halls, and event spaces.",
  },
};

export function buildStaticPageMetadata(path, options = {}) {
  const config = STATIC_PAGE_SEO[path];

  if (!config) {
    throw new Error(`Missing static SEO config for path: ${path}`);
  }

  return buildMetadata({
    title: config.title,
    description: config.description,
    path,
    ...options,
  });
}
