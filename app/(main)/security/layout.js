import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/security");

export default function SecurityLayout({ children }) {
  return children;
}
