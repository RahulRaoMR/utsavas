import { buildCategoryMetadata } from "../../../lib/seo";

export const metadata = buildCategoryMetadata({
  title: "Wedding Halls",
  route: "/wedding-halls",
  description:
    "Browse wedding halls in Bangalore and across Karnataka on UTSAVAS. Compare pricing, photos, capacity, location, and venue details before booking.",
  keywords: [
    "best wedding halls in Bangalore",
    "marriage halls Bangalore",
    "wedding venues Karnataka",
  ],
});

export default function WeddingHallsLayout({ children }) {
  return children;
}
