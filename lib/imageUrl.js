const BACKEND_BASE_URL = "https://utsavas-backend-1.onrender.com";

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
  return `${BACKEND_BASE_URL}${normalized}`;
}
