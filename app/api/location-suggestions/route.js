import { NextResponse } from "next/server";

const POSTAL_API_BASE = "https://api.postalpincode.in";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanOfficeName(value) {
  return String(value || "")
    .replace(/\s+\(([^)]+)\)\s*$/i, "")
    .replace(/\s+(B\.O|S\.O|H\.O|G\.P\.O\.?)$/i, "")
    .trim();
}

function buildLocationSummary(postOffice) {
  const area =
    postOffice?.Block ||
    postOffice?.Taluk ||
    postOffice?.District ||
    "";
  const district = postOffice?.District || "";
  const pinCode = postOffice?.Pincode || postOffice?.PINCode || "";

  return [area, district && district !== area ? district : "", "Karnataka", pinCode]
    .filter(Boolean)
    .join(" - ");
}

function toSuggestion(postOffice, query) {
  const label = cleanOfficeName(postOffice?.Name);
  const pinCode = postOffice?.Pincode || postOffice?.PINCode || "";
  const normalizedQuery = normalizeText(query);
  const isPinSearch = /^\d{6}$/.test(normalizedQuery);

  if (!label) {
    return null;
  }

  return {
    label,
    sublabel: buildLocationSummary(postOffice),
    value: isPinSearch ? pinCode || label : label,
    searchValue: isPinSearch ? pinCode || label : label,
    source: "postal",
  };
}

async function fetchPostalResults(query) {
  const normalizedQuery = String(query || "").trim();

  if (!normalizedQuery) {
    return [];
  }

  const endpoint = /^\d{6}$/.test(normalizedQuery)
    ? `${POSTAL_API_BASE}/pincode/${encodeURIComponent(normalizedQuery)}`
    : `${POSTAL_API_BASE}/postoffice/${encodeURIComponent(normalizedQuery)}`;

  const res = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "utsavas/1.0 location-search",
    },
  });

  if (!res.ok) {
    return [];
  }

  const payload = await res.json();
  const entries = Array.isArray(payload) ? payload : [];
  const postOffices = Array.isArray(entries[0]?.PostOffice) ? entries[0].PostOffice : [];

  return postOffices
    .filter((item) => normalizeText(item?.State) === "karnataka")
    .map((item) => toSuggestion(item, normalizedQuery))
    .filter(Boolean);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = String(searchParams.get("q") || "").trim();

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await fetchPostalResults(query);
    return NextResponse.json(suggestions.slice(0, 12));
  } catch (error) {
    console.error("LOCATION SUGGESTIONS API ERROR", error);
    return NextResponse.json([]);
  }
}
