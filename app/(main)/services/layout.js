import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/events", {
  noIndex: true,
});

export default function ServicesLegacyLayout({ children }) {
  return children;
}
