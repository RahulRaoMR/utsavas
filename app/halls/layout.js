import { buildCategoryMetadata } from "../../lib/seo";

export const metadata = buildCategoryMetadata({
  title: "Wedding and Event Halls",
  route: "/halls",
  description:
    "Discover approved wedding and event halls on UTSAVAS. Browse photos, venue details, and location information for celebration spaces across Karnataka.",
  keywords: [
    "event halls Bangalore",
    "wedding and event halls Karnataka",
    "approved venues utsavas",
  ],
});

export default function HallsLayout({ children }) {
  return children;
}
