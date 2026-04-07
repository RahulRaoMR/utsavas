import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/about", {
  noIndex: true,
});

export default function AboutUsLegacyLayout({ children }) {
  return children;
}
