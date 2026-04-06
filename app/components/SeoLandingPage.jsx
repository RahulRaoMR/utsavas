import Link from "next/link";
import connectDB from "../../lib/mongodb";
import { getApiBaseUrl } from "../../lib/api";
import Hall from "../../models/Hall";
import {
  buildAbsoluteUrl,
  buildMetadata,
  buildHallJsonLd,
  DEFAULT_SEO_IMAGE,
  SITE_NAME,
} from "../../lib/seo";
import {
  getRelatedSeoLandingPages,
} from "../../lib/seoLandingPages";
import {
  getVenueCategoryLabel,
  getVenueRoute,
  normalizeVenueCategory,
} from "../../lib/venueCategories";
import { sortHallsByListingPriority } from "../../lib/listingPlans";
import styles from "./SeoLandingPage.module.css";

const MONGODB_URI = process.env.MONGODB_URI;

function formatAddress(hall) {
  return [hall?.address?.area, hall?.address?.city, hall?.address?.state]
    .filter(Boolean)
    .join(", ");
}

function formatPrice(hall) {
  const eventPrice = Number(hall?.pricePerEvent) || 0;
  const dayPrice = Number(hall?.pricePerDay) || 0;
  const platePrice = Number(hall?.pricePerPlate) || 0;

  if (eventPrice > 0) {
    return `Rs ${eventPrice.toLocaleString("en-IN")} per event`;
  }

  if (dayPrice > 0) {
    return `Rs ${dayPrice.toLocaleString("en-IN")} per day`;
  }

  if (platePrice > 0) {
    return `Rs ${platePrice.toLocaleString("en-IN")} per plate`;
  }

  return "Price on request";
}

function matchesLocation(hall, locationTerms) {
  if (!Array.isArray(locationTerms) || locationTerms.length === 0) {
    return true;
  }

  const haystack = [
    hall?.address?.city,
    hall?.address?.area,
    hall?.address?.landmark,
    hall?.address?.state,
    hall?.hallName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return locationTerms.some((term) => haystack.includes(String(term).toLowerCase()));
}

function matchesCategory(hall, categoryValue) {
  if (!categoryValue) {
    return true;
  }

  return normalizeVenueCategory(hall?.category) === normalizeVenueCategory(categoryValue);
}

async function loadLandingHalls(config) {
  if (!MONGODB_URI) {
    return loadLandingHallsFromApi(config);
  }

  try {
    await connectDB();

    const halls = await Hall.find({ status: "approved" })
      .select(
        "_id hallName category capacity address pricePerEvent pricePerDay pricePerPlate about listingPlan listingPriority createdAt updatedAt images"
      )
      .lean();

    return selectLandingHalls(config, halls);
  } catch (error) {
    console.error("FAILED TO LOAD SEO LANDING HALLS FROM MONGODB", error);
    return loadLandingHallsFromApi(config);
  }
}

function selectLandingHalls(config, halls) {
  const sortedHalls = sortHallsByListingPriority(halls);
  const matchedHalls = sortedHalls.filter(
    (hall) =>
      matchesCategory(hall, config.categoryValue) &&
      matchesLocation(hall, config.locationTerms)
  );

  if (matchedHalls.length > 0) {
    return matchedHalls.slice(0, 6);
  }

  return sortedHalls
    .filter((hall) => matchesCategory(hall, config.categoryValue))
    .slice(0, 6);
}

async function loadLandingHallsFromApi(config) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/halls/public`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const halls = await response.json();
    return selectLandingHalls(config, Array.isArray(halls) ? halls : []);
  } catch (error) {
    console.error("FAILED TO LOAD SEO LANDING HALLS FROM API", error);
    return [];
  }
}

function buildLandingJsonLd(config, halls) {
  const pageUrl = buildAbsoluteUrl(`/${config.slug}`);
  const itemList = halls.map((hall, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: buildAbsoluteUrl(`${getVenueRoute(hall.category)}/${hall._id}`),
    name: hall.hallName,
  }));

  const faqItems = (config.faq || []).map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.heroTitle,
    description: config.metaDescription,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: buildAbsoluteUrl("/"),
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: itemList,
    },
  };

  const faqPage =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems,
        }
      : null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: buildAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: config.title,
        item: pageUrl,
      },
    ],
  };

  return [collectionPage, breadcrumbs, faqPage].filter(Boolean);
}

export function buildSeoLandingMetadata(config) {
  return buildMetadata({
    title: `${config.title} | ${SITE_NAME}`,
    description: config.metaDescription,
    path: `/${config.slug}`,
    keywords: config.keywords || [],
    image: DEFAULT_SEO_IMAGE,
  });
}

export default async function SeoLandingPage({ config }) {
  const halls = await loadLandingHalls(config);
  const relatedPages = getRelatedSeoLandingPages(config.slug);
  const jsonLdItems = buildLandingJsonLd(config, halls);
  const hallJsonLdItems = halls
    .map((hall) => buildHallJsonLd(hall, `${getVenueRoute(hall.category)}/${hall._id}`))
    .filter(Boolean);

  return (
    <div className={styles.page}>
      {jsonLdItems.map((item, index) => (
        <script
          key={`landing-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      {hallJsonLdItems.map((item, index) => (
        <script
          key={`hall-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className={styles.hero}>
        <p className={styles.eyebrow}>{config.title}</p>
        <h1>{config.heroTitle}</h1>
        <p className={styles.intro}>{config.intro}</p>

        <div className={styles.chips}>
          <span>{config.locationLabel}</span>
          <span>{config.categoryValue ? getVenueCategoryLabel(config.categoryValue) : "Mixed venue types"}</span>
          <span>Local SEO landing page</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Featured Search Intent</p>
            <h2>{config.title} on UTSAVAS</h2>
          </div>
          <Link href={config.routePath} className={styles.primaryLink}>
            Explore all venues
          </Link>
        </div>

        <div className={styles.copyGrid}>
          {config.contentSections.map((section) => (
            <article key={section.heading} className={styles.copyCard}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Venue Suggestions</p>
            <h2>Popular venue listings for this search</h2>
          </div>
        </div>

        <div className={styles.venueGrid}>
          {halls.map((hall) => (
            <Link
              key={hall._id}
              href={`${getVenueRoute(hall.category)}/${hall._id}`}
              className={styles.venueCard}
            >
              <span className={styles.venueCategory}>
                {getVenueCategoryLabel(hall.category) || "Venue"}
              </span>
              <h3>{hall.hallName}</h3>
              <p>{formatAddress(hall) || "Karnataka"}</p>
              <div className={styles.venueMeta}>
                <span>{formatPrice(hall)}</span>
                <span>{hall.capacity ? `${hall.capacity} guests` : "Capacity on request"}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Nearby Searches</p>
            <h2>Popular nearby locations and search themes</h2>
          </div>
        </div>

        <div className={styles.areaList}>
          {config.nearbyAreas.map((area) => (
            <span key={area} className={styles.areaChip}>
              {area}
            </span>
          ))}
        </div>

        {relatedPages.length > 0 ? (
          <div className={styles.relatedGrid}>
            {relatedPages.map((page) => (
              <Link key={page.slug} href={`/${page.slug}`} className={styles.relatedCard}>
                <strong>{page.title}</strong>
                <span>{page.locationLabel}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>FAQ</p>
            <h2>Questions people ask before booking</h2>
          </div>
        </div>

        <div className={styles.faqList}>
          {config.faq.map((item) => (
            <article key={item.question} className={styles.faqCard}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
