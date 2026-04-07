import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/help", {
  noIndex: true,
});

export default function HelpSupportLegacyLayout({ children }) {
  return children;
}
