import VenueDetailPage from "../../../components/VenueDetailPage";
import {
  buildHallJsonLd,
  buildHallMetadata,
  getApprovedHallById,
} from "../../../../lib/seo";
import "./hallDetail.css";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const canonicalPath = `/wedding-halls/${id}`;
  const hall = await getApprovedHallById(id);

  return buildHallMetadata(hall, canonicalPath);
}

export default async function HallDetailRoute({ params }) {
  const { id } = await params;
  const hall = await getApprovedHallById(id);
  const hallJsonLd = buildHallJsonLd(hall, `/wedding-halls/${id}`);

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
