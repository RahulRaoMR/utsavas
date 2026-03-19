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
      { url: "/pwa/icon-192.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/pwa/apple-touch-icon.png",
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
        <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png" />
      </head>
      <body>
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
