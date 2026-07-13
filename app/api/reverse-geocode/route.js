import { NextResponse } from "next/server";

function toCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function pickLocationName(address, displayName) {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    address?.suburb ||
    address?.neighbourhood ||
    address?.county ||
    displayName?.split(",")?.[0]?.trim() ||
    ""
  );
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = toCoordinate(searchParams.get("lat"));
  const lon = toCoordinate(searchParams.get("lon"));

  if (lat === null || lon === null) {
    return NextResponse.json(
      { message: "Valid lat and lon query parameters are required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": "utsavas/1.0 reverse-geocoder",
        Referer: "https://utsavas.local",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Unable to detect a destination for these coordinates" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const location = pickLocationName(data?.address || {}, data?.display_name);

    if (!location) {
      return NextResponse.json(
        { message: "No destination found for these coordinates" },
        { status: 404 }
      );
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("REVERSE GEOCODE API ERROR", error);

    return NextResponse.json(
      { message: "Failed to reverse geocode coordinates" },
      { status: 500 }
    );
  }
}
