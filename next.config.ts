import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const productionBackendOrigin = "https://utsavas-backend-1.onrender.com";

function getAllowedApiOrigin() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredApiUrl) {
    return productionBackendOrigin;
  }

  try {
    return new URL(configuredApiUrl).origin;
  } catch {
    return productionBackendOrigin;
  }
}

const apiOrigin = getAllowedApiOrigin();

const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    isDevelopment ? "'unsafe-eval'" : "",
    "https://checkout.razorpay.com",
    "https://*.razorpay.com",
  ].filter(Boolean).join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https:",
    productionBackendOrigin,
    apiOrigin,
    "https://*.tile.openstreetmap.org",
  ].join(" "),
  [
    "connect-src",
    "'self'",
    "http://localhost:5000",
    productionBackendOrigin,
    apiOrigin,
    "https://maps.googleapis.com",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.firebaseapp.com",
    "https://*.razorpay.com",
  ].join(" "),
  [
    "frame-src",
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://*.razorpay.com",
    "https://www.google.com",
    "https://maps.google.com",
  ].join(" "),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self' blob: data: https:",
  isDevelopment ? "" : "upgrade-insecure-requests",
].filter(Boolean).join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
