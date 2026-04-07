import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/report-fraud");

export default function ReportFraudLayout({ children }) {
  return children;
}
