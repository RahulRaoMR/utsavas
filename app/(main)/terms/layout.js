import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/terms");

export default function TermsLayout({ children }) {
  return children;
}
