export const DEFAULT_VENUE_ROUTE = "/wedding-halls";

const ROUTE_SECTION_CATEGORY = {
  "/wedding-halls": "wedding",
  "/banquet-halls": "banquet-halls",
  "/party-venues": "party",
};

export const VENUE_TYPE_OPTIONS = [
  {
    value: "premium-venues",
    label: "Premium Venues",
    route: "/wedding-halls",
  },
  {
    value: "resorts",
    label: "Resorts",
    route: "/wedding-halls",
  },
  {
    value: "banquet-halls",
    label: "Banquet Halls",
    route: "/banquet-halls",
  },
  {
    value: "farm-houses",
    label: "Farm Houses",
    route: "/party-venues",
  },
  {
    value: "convention-halls",
    label: "Convention halls",
    route: "/banquet-halls",
  },
  {
    value: "kalyana-mandapams",
    label: "Kalyana Mandapams",
    route: "/wedding-halls",
  },
  {
    value: "destination-weddings",
    label: "Destination Weddings",
    route: "/wedding-halls",
  },
  {
    value: "lawns",
    label: "Lawns",
    route: "/party-venues",
  },
  {
    value: "5-star-hotels",
    label: "5 star Hotels",
    route: "/banquet-halls",
  },
  {
    value: "4-star-hotels",
    label: "4 star Hotels",
    route: "/banquet-halls",
  },
  {
    value: "mini-halls",
    label: "Mini halls",
    route: "/banquet-halls",
  },
  {
    value: "fort-and-palaces",
    label: "Fort and Palaces",
    route: "/wedding-halls",
  },
  {
    value: "wedding",
    label: "Wedding Hall",
    route: "/wedding-halls",
  },
  {
    value: "party",
    label: "Party Venue",
    route: "/party-venues",
  },
];

const VENUE_CARD_METADATA = {
  "premium-venues": {
    image: "/gallery/g1.jpg",
    meta: "Signature wedding spaces",
  },
  resorts: {
    image: "/dashboard/Resorts.jpeg",
    meta: "Destination-style escapes",
  },
  "banquet-halls": {
    image: "/dashboard/banquet.jpg",
    meta: "Formal hosted gatherings",
  },
  "farm-houses": {
    image: "/dashboard/Farm Houses.jpeg",
    meta: "Private outdoor venues",
  },
  "convention-halls": {
    image: "/gallery/g4.jpg",
    meta: "Large-format event hosting",
  },
  "kalyana-mandapams": {
    image: "/dashboard/Kalyana Mandapams.jpeg",
    meta: "Traditional celebration settings",
  },
  "destination-weddings": {
    image: "/dashboard/Destination Weddings.jpeg",
    meta: "Scenic celebration experiences",
  },
  lawns: {
    image: "/dashboard/Lawns.jpeg",
    meta: "Open-air luxury events",
  },
  "5-star-hotels": {
    image: "/gallery/g21.jpg",
    meta: "Premium hospitality venues",
  },
  "4-star-hotels": {
    image: "/dashboard/4 star Hotels.jpg",
    meta: "Refined event-ready hotels",
  },
  "mini-halls": {
    image: "/gallery/g23.jpg",
    meta: "Compact elegant functions",
  },
  "fort-and-palaces": {
    image: "/gallery/g15.jpg",
    meta: "Heritage-inspired celebrations",
  },
  wedding: {
    image: "/gallery/g16.jpg",
    meta: "Classic ceremony venues",
  },
  party: {
    image: "/gallery/g4.jpg",
    meta: "Lively social occasions",
  },
};

const LEGACY_CATEGORY_ALIASES = {
  banquet: "banquet-halls",
  banquethall: "banquet-halls",
  "banquet hall": "banquet-halls",
  "banquet halls": "banquet-halls",
  weddinghall: "wedding",
  "wedding hall": "wedding",
  "party venue": "party",
  "party venues": "party",
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeVenueCategory(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  return LEGACY_CATEGORY_ALIASES[normalized] || normalized;
}

export function getVenueCategory(value) {
  const normalized = normalizeVenueCategory(value);
  return VENUE_TYPE_OPTIONS.find((option) => option.value === normalized) || null;
}

export function getVenueCategoryLabel(value) {
  const category = getVenueCategory(value);
  if (category) {
    return category.label;
  }

  const normalized = normalizeVenueCategory(value);
  if (!normalized) {
    return "";
  }

  return normalized
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getVenueRoute(value) {
  return getVenueCategory(value)?.route || DEFAULT_VENUE_ROUTE;
}

export function categoryBelongsToRoute(value, route) {
  return getVenueRoute(value) === route;
}

export function isRouteSectionCategory(value, route) {
  const normalized = normalizeVenueCategory(value);
  return Boolean(normalized) && ROUTE_SECTION_CATEGORY[route] === normalized;
}

export function getVenueCategoryCards() {
  return VENUE_TYPE_OPTIONS.map((option) => ({
    key: option.value,
    title: option.label,
    route: option.route,
    image: VENUE_CARD_METADATA[option.value]?.image || "/dashboard/banquet.jpg",
    meta: VENUE_CARD_METADATA[option.value]?.meta || "Curated venue category",
  }));
}
