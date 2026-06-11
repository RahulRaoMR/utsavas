import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

  export const metadata = buildStaticPageMetadata("/privacy-policy");

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
