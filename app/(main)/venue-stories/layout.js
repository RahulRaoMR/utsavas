import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/venue-stories");

export default function VenueStoriesLayout({ children }) {
  return children;
}
