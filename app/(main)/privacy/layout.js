import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/privacy");

export default function PrivacyLayout({ children }) {
  return children;
}
