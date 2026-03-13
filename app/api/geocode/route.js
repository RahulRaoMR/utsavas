import { NextResponse } from "next/server";

function normalizeLocation(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

async function searchQuery(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=in&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "utsavas/1.0 venue-geocoder",
      Referer: "https://utsavas.local",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const results = await res.json();
  if (!Array.isArray(results) || !results.length) {
    return null;
  }

  return normalizeLocation({
    lat: results[0].lat,
    lng: results[0].lon,
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const queries = searchParams
    .getAll("query")
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (!queries.length) {
    return NextResponse.json(
      { message: "At least one query is required" },
      { status: 400 }
    );
  }

  try {
    for (const query of queries) {
      const location = await searchQuery(query);
      if (location) {
        return NextResponse.json({
          location,
          matchedQuery: query,
        });
      }
    }

    return NextResponse.json({
      location: null,
      matchedQuery: null,
    });
  } catch (error) {
    console.error("GEOCODE API ERROR", error);

    return NextResponse.json(
      { message: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
