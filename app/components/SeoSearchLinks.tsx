import Link from "next/link";
import { SEO_LANDING_PAGES } from "../../lib/seoLandingPages";
import { getVenueCategoryLabel } from "../../lib/venueCategories";
import styles from "./SeoSearchLinks.module.css";

const CITY_PAGES = SEO_LANDING_PAGES.filter(
  (page) => page.locationLabel === "Bangalore"
).slice(0, 4);

const LOCALITY_PAGES = SEO_LANDING_PAGES.filter(
  (page) => page.locationLabel !== "Bangalore"
).slice(0, 8);

const FEATURED_PAGES = [...CITY_PAGES, ...LOCALITY_PAGES];

export default function SeoSearchLinks() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Popular Google Searches</p>
          <h2>Explore venue pages built for Bangalore-area searches</h2>
          <p>
            Browse {SEO_LANDING_PAGES.length} dedicated landing pages for
            wedding halls, banquet halls, marriage halls, and party venues
            across Bangalore and high-intent nearby localities.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURED_PAGES.map((page) => (
            <Link key={page.slug} href={`/${page.slug}`} className={styles.card}>
              <strong>{page.title}</strong>
              <span>{page.locationLabel}</span>
              <small>
                {page.categoryValue
                  ? getVenueCategoryLabel(page.categoryValue)
                  : "Mixed venue types"}
              </small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
