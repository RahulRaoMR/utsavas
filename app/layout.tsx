import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalAlertHost from "./components/GlobalAlertHost";
import PwaRegistration from "./components/PwaRegistration";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_IMAGE,
  DEFAULT_SEO_KEYWORDS,
  DEFAULT_SEO_TITLE,
  GOOGLE_SITE_VERIFICATION,
  SITE_URL,
} from "../lib/seo";

const organizationJsonLd = buildOrganizationJsonLd();
const websiteJsonLd = buildWebsiteJsonLd();

export const metadata: Metadata = {
  applicationName: "UTSAVAS",
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SEO_TITLE,
    template: "%s | UTSAVAS",
  },
  description: DEFAULT_SEO_DESCRIPTION,
  keywords: DEFAULT_SEO_KEYWORDS,
  manifest: "/manifest.webmanifest",
  category: "venue booking",
  referrer: "origin-when-cross-origin",
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "UTSAVAS",
    locale: "en_IN",
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [
      {
        url: DEFAULT_SEO_IMAGE,
        width: 1200,
        height: 630,
        alt: "UTSAVAS venue booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [DEFAULT_SEO_IMAGE],
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
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&family=Playfair+Display:wght@400;500;600;700&display=swap"
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
        <GlobalAlertHost>
          <PwaRegistration />
          {children}
        </GlobalAlertHost>
      </body>
    </html>
  );
}
