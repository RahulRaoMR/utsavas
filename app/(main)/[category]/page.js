import { Suspense } from "react";
import { notFound } from "next/navigation";
import VenueCategoryPage from "../../components/VenueCategoryPage";
import SeoLandingPage, {
  buildSeoLandingMetadata,
} from "../../components/SeoLandingPage";
import {
  getVenueCategoryByPath,
  VENUE_TYPE_OPTIONS,
} from "../../../lib/venueCategories";
import { buildCategoryMetadata } from "../../../lib/seo";
import { SEO_LANDING_PAGES, getSeoLandingPageBySlug } from "../../../lib/seoLandingPages";
import "../wedding-halls/weddingHalls.css";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);

  if (categoryConfig) {
    return buildCategoryMetadata({
      title: categoryConfig.label,
      route: categoryConfig.route,
      keywords: [
        `${categoryConfig.label} Bangalore`,
        `${categoryConfig.label} Karnataka`,
      ],
    });
  }

  const landingConfig = getSeoLandingPageBySlug(category);

  if (landingConfig) {
    return buildSeoLandingMetadata(landingConfig);
  }

  return {};
}

export async function generateStaticParams() {
  const categoryParams = VENUE_TYPE_OPTIONS.map((category) => ({
    category: category.route.replace(/^\//, ""),
  }));
  const landingParams = SEO_LANDING_PAGES.map((page) => ({
    category: page.slug,
  }));

  return [...categoryParams, ...landingParams];
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);

  if (categoryConfig) {
    return (
      <Suspense fallback={<p style={{ padding: 20, color: "#777" }}>Loading halls...</p>}>
        <VenueCategoryPage
          routePath={categoryConfig.route}
          title={categoryConfig.label}
          section={categoryConfig.section}
          categoryValue={categoryConfig.value}
        />
      </Suspense>
    );
  }

  const landingConfig = getSeoLandingPageBySlug(category);

  if (landingConfig) {
    return <SeoLandingPage config={landingConfig} />;
  }

  notFound();
}
