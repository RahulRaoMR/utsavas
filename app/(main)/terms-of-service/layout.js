import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/terms", {
  noIndex: true,
});

export default function TermsLegacyLayout({ children }) {
  return children;
}
