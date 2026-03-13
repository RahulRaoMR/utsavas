const PRODUCTION_BACKEND_BASE_URL = "https://utsavas-backend-1.onrender.com";

export function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return process.env.NEXT_PUBLIC_API_URL || PRODUCTION_BACKEND_BASE_URL;
}

export async function getHalls() {
  const res = await fetch(`${getApiBaseUrl()}/api/halls`);
  return res.json();
}

export async function getVendors() {
  const res = await fetch(`${getApiBaseUrl()}/api/vendor`);
  return res.json();
}
