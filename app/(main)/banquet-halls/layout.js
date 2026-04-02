import { buildCategoryMetadata } from "../../../lib/seo";

export const metadata = buildCategoryMetadata({
  title: "Banquet Halls",
  route: "/banquet-halls",
  description:
    "Explore banquet halls in Bangalore and nearby Karnataka locations with UTSAVAS. View venue photos, pricing, guest capacity, and booking details in one place.",
  keywords: [
    "banquet halls in Bangalore",
    "banquet halls near me",
    "event banquet venues Karnataka",
  ],
});

export default function BanquetHallsLayout({ children }) {
  return children;
}
