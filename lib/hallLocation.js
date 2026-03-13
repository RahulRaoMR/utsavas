export const INDIA_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

function toCleanText(value) {
  return String(value ?? "").trim();
}

export function cleanAddressPart(value) {
  const text = toCleanText(value);
  if (
    !text ||
    text === "0" ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return "";
  }

  return text;
}

export function buildAddressQuery(address = {}) {
  return [
    address.flat,
    address.floor,
    address.landmark,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .map(cleanAddressPart)
    .filter(Boolean)
    .join(", ");
}

export function buildAddressQueries(address = {}) {
  const hallName = cleanAddressPart(address.flat);
  const floor = cleanAddressPart(address.floor);
  const landmark = cleanAddressPart(address.landmark);
  const area = cleanAddressPart(address.area);
  const city = cleanAddressPart(address.city);
  const state = cleanAddressPart(address.state);
  const pincode = cleanAddressPart(address.pincode);

  const queries = [
    [hallName, floor, landmark, area, city, state, pincode],
    [hallName, landmark, area, city, state, pincode],
    [area, city, state, pincode],
    [landmark, city, state, pincode],
    [pincode, city, state],
    [area, city, state],
    [landmark, area, city, state],
    [city, state, pincode],
    [city, state],
  ]
    .map((parts) => parts.filter(Boolean).join(", "))
    .filter(Boolean);

  return [...new Set(queries)];
}

export function hasMinimumVenueAddress(address = {}) {
  return Boolean(
    cleanAddressPart(address.city) &&
      cleanAddressPart(address.state) &&
      (
        cleanAddressPart(address.area) ||
        cleanAddressPart(address.pincode) ||
        cleanAddressPart(address.landmark) ||
        cleanAddressPart(address.flat)
      )
  );
}

export function normalizeLocation(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001)
  ) {
    return null;
  }

  return { lat, lng };
}

export function isValidLocation(location) {
  return Boolean(normalizeLocation(location));
}

export function getFullAddress(address = {}) {
  const landmark = cleanAddressPart(address.landmark);

  return [
    cleanAddressPart(address.flat),
    cleanAddressPart(address.floor),
    cleanAddressPart(address.area),
    cleanAddressPart(address.city),
    cleanAddressPart(address.state),
    cleanAddressPart(address.pincode),
    landmark ? `near ${landmark}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

export async function geocodeAddress(queryOrAddress) {
  const queries = Array.isArray(queryOrAddress)
    ? queryOrAddress
    : typeof queryOrAddress === "string"
    ? [queryOrAddress]
    : buildAddressQueries(queryOrAddress);

  const filteredQueries = queries.map(cleanAddressPart).filter(Boolean);

  if (!filteredQueries.length) {
    return null;
  }

  try {
    const params = new URLSearchParams();
    filteredQueries.forEach((value) => params.append("query", value));

    const res = await fetch(`/api/geocode?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return normalizeLocation(data?.location);
  } catch (error) {
    console.error("GEOCODE ADDRESS ERROR", error);
    return null;
  }
}

export function buildVenueMapUrls({ hallName = "", address = {}, location }) {
  const fullAddress = getFullAddress(address);
  const mapSearchText = fullAddress || cleanAddressPart(hallName) || "Venue";
  const coordinates = normalizeLocation(location);
  const destination = coordinates
    ? `${coordinates.lat},${coordinates.lng}`
    : mapSearchText;

  return {
    coordinates,
    fullAddress,
    hasCoordinates: Boolean(coordinates),
    mapEmbedUrl: coordinates
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          destination
        )}&z=15&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          mapSearchText
        )}&z=15&output=embed`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destination
    )}`,
    openMapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destination
    )}`,
  };
}
