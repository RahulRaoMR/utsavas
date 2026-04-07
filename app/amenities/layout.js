import { buildStaticPageMetadata } from "../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/amenities");

export default function AmenitiesLayout({ children }) {
  return children;
}
