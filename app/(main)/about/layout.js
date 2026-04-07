import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/about");

export default function AboutLayout({ children }) {
  return children;
}
