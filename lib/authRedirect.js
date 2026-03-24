export function sanitizeRedirectPath(redirect, fallback = "/dashboard") {
  if (typeof redirect !== "string") {
    return fallback;
  }

  const trimmed = redirect.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}

export function clearUserSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
