import { buildCategoryMetadata } from "../../../lib/seo";

export const metadata = buildCategoryMetadata({
  title: "Party Venues",
  route: "/party-venues",
  description:
    "Find party venues in Bangalore and Karnataka with UTSAVAS. Compare event spaces, venue photos, pricing, capacity, and location details before you book.",
  keywords: [
    "party venues in Bangalore",
    "birthday party halls Bangalore",
    "celebration venues Karnataka",
  ],
});

export default function PartyVenuesLayout({ children }) {
  return children;
}
