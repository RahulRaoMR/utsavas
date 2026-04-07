import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/help");

export default function HelpLayout({ children }) {
  return children;
}
