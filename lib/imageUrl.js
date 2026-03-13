const PRODUCTION_BACKEND_BASE_URL = "https://utsavas-backend-1.onrender.com";

function getBackendBaseUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return process.env.NEXT_PUBLIC_API_URL || PRODUCTION_BACKEND_BASE_URL;
}

export function toAbsoluteImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";

  const trimmed = imagePath.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getBackendBaseUrl()}${normalized}`;
}
