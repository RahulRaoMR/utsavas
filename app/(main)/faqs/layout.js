import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/faqs");

export default function FaqLayout({ children }) {
  return children;
}
