import { notFound } from "next/navigation";
import VenueDetailPage from "../../../components/VenueDetailPage";
import {
  getVenueCategoryByPath,
} from "../../../../lib/venueCategories";
import {
  buildHallJsonLd,
  buildHallMetadata,
  getApprovedHallById,
} from "../../../../lib/seo";
import "../../wedding-halls/[id]/hallDetail.css";

export async function generateMetadata({ params }) {
  const { category, id } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);
  const canonicalPath = `/${category}/${id}`;

  if (!categoryConfig) {
    return buildHallMetadata(null, canonicalPath);
  }

  const hall = await getApprovedHallById(id);
  return buildHallMetadata(hall, canonicalPath);
}

export default async function CategoryDetailPage({ params }) {
  const { category, id } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);

  if (!categoryConfig) {
    notFound();
  }

  const hall = await getApprovedHallById(id);
  const hallJsonLd = buildHallJsonLd(hall, `/${category}/${id}`);

  return (
    <>
      {hallJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hallJsonLd) }}
        />
      ) : null}
      <VenueDetailPage />
    </>
  );
}
