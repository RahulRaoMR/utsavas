import { buildStaticPageMetadata } from "../../../lib/staticPageSeo";

export const metadata = buildStaticPageMetadata("/events");

export default function EventsLayout({ children }) {
  return children;
}
