import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/contact");

export default function ContactLayout({ children }) {
  return children;
}
