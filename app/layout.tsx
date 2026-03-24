import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegistration from "./components/PwaRegistration";

export const metadata: Metadata = {
  applicationName: "UTSAVAS",
  title: {
    default: "UTSAVAS",
    template: "%s | UTSAVAS",
  },
  description:
    "Discover wedding halls, banquet halls, party venues, and trusted event spaces across Karnataka with UTSAVAS.",
  manifest: "/manifest.webmanifest",
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
      </head>
      <body>
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
