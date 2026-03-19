import { notFound } from "next/navigation";
import VenueDetailPage from "../../../components/VenueDetailPage";
import {
  getVenueCategoryByPath,
} from "../../../../lib/venueCategories";
import "../../wedding-halls/[id]/hallDetail.css";

export default async function CategoryDetailPage({ params }) {
  const { category } = await params;
  const categoryConfig = getVenueCategoryByPath(`/${category}`);

  if (!categoryConfig) {
    notFound();
  }

  return <VenueDetailPage />;
}
