import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegistration from "./components/PwaRegistration";

const SITE_URL = "https://utsavas.com";
const SEO_IMAGE_PATH = "/seo/utsavas-search-share-v1.png";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UTSAVAS",
  url: SITE_URL,
  logo: `${SITE_URL}/pwa/icon-512-v3.png`,
  image: `${SITE_URL}${SEO_IMAGE_PATH}`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "UTSAVAS",
  url: SITE_URL,
  image: `${SITE_URL}${SEO_IMAGE_PATH}`,
};

export const metadata: Metadata = {
  applicationName: "UTSAVAS",
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UTSAVAS",
    template: "%s | UTSAVAS",
  },
  description:
    "Discover wedding halls, banquet halls, party venues, and trusted event spaces across Karnataka with UTSAVAS.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "UTSAVAS",
    title: "UTSAVAS",
    description:
      "Discover wedding halls, banquet halls, party venues, and trusted event spaces across Karnataka with UTSAVAS.",
    images: [
      {
        url: SEO_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "UTSAVAS venue booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UTSAVAS",
    description:
      "Discover wedding halls, banquet halls, party venues, and trusted event spaces across Karnataka with UTSAVAS.",
    images: [SEO_IMAGE_PATH],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/pwa/favicon-32-v3.png", sizes: "32x32", type: "image/png" },
      { url: "/pwa/icon-192-v3.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512-v3.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/pwa/apple-touch-icon-v3.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UTSAVAS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#3f6fb6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/pwa/favicon-32-v3.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/pwa/apple-touch-icon-v3.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
