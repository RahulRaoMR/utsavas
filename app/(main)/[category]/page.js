import { Suspense } from "react";
import { notFound } from "next/navigation";
import VenueCategoryPage from "../../components/VenueCategoryPage";
import {
  getVenueCategoryByPath,
} from "../../../lib/venueCategories";
import "../wedding-halls/weddingHalls.css";

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);

  if (!categoryConfig) {
    notFound();
  }

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
