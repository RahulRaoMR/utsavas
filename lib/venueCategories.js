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
    route: "/premium-venues",
    section: "wedding",
  },
  {
    value: "resorts",
    label: "Resorts",
    route: "/resorts",
    section: "wedding",
  },
  {
    value: "banquet-halls",
    label: "Banquet Halls",
    route: "/banquet-halls",
    section: "banquet-halls",
  },
  {
    value: "farm-houses",
    label: "Farm Houses",
    route: "/farm-houses",
    section: "party",
  },
  {
    value: "convention-halls",
    label: "Convention halls",
    route: "/convention-halls",
    section: "banquet-halls",
  },
  {
    value: "kalyana-mandapams",
    label: "Kalyana Mandapams",
    route: "/kalyana-mandapams",
    section: "wedding",
  },
  {
    value: "destination-weddings",
    label: "Destination Weddings",
    route: "/destination-weddings",
    section: "wedding",
  },
  {
    value: "lawns",
    label: "Lawns",
    route: "/lawns",
    section: "party",
  },
  {
    value: "5-star-hotels",
    label: "5 star Hotels",
    route: "/5-star-hotels",
    section: "banquet-halls",
  },
  {
    value: "4-star-hotels",
    label: "4 star Hotels",
    route: "/4-star-hotels",
    section: "banquet-halls",
  },
  {
    value: "mini-halls",
    label: "Mini halls",
    route: "/mini-halls",
    section: "banquet-halls",
  },
  {
    value: "fort-and-palaces",
    label: "Fort and Palaces",
    route: "/fort-and-palaces",
    section: "wedding",
  },
  {
    value: "wedding",
    label: "Wedding Hall",
    route: "/wedding-halls",
    section: "wedding",
  },
  {
    value: "party",
    label: "Party Venue",
    route: "/party-venues",
    section: "party",
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

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function slugifyCategory(value) {
  return normalizeText(value)
    .replace(/&/g, " and ")
    .replace(/[/,]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const LEGACY_CATEGORY_ALIASES = {
  banquet: "banquet-halls",
  banquethall: "banquet-halls",
  "banquet hall": "banquet-halls",
  "banquet halls": "banquet-halls",
  weddinghall: "wedding",
  "wedding hall": "wedding",
  "premium venue": "premium-venues",
  "premium venues": "premium-venues",
  resort: "resorts",
  "farm house": "farm-houses",
  "farm houses": "farm-houses",
  "convention hall": "convention-halls",
  "convention halls": "convention-halls",
  "kalyana mandapam": "kalyana-mandapams",
  "kalyana mandapams": "kalyana-mandapams",
  "destination wedding": "destination-weddings",
  "destination wedding hall": "destination-weddings",
  "destination weddings": "destination-weddings",
  lawn: "lawns",
  lawns: "lawns",
  "5 star hotel": "5-star-hotels",
  "5 star hotels": "5-star-hotels",
  "4 star hotel": "4-star-hotels",
  "4 star hotels": "4-star-hotels",
  "mini hall": "mini-halls",
  "mini halls": "mini-halls",
  "fort and palace": "fort-and-palaces",
  "fort and palaces": "fort-and-palaces",
  "party venue": "party",
  "party venues": "party",
};

const CATEGORY_ALIASES = VENUE_TYPE_OPTIONS.reduce((lookup, option) => {
  lookup[normalizeText(option.value)] = option.value;
  lookup[normalizeText(option.label)] = option.value;
  lookup[slugifyCategory(option.label)] = option.value;
  return lookup;
}, { ...LEGACY_CATEGORY_ALIASES });

export function normalizeVenueCategory(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  const slugified = slugifyCategory(normalized);

  return (
    CATEGORY_ALIASES[normalized] ||
    CATEGORY_ALIASES[slugified] ||
    slugified
  );
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

export function getVenueSection(value) {
  return getVenueCategory(value)?.section || "";
}

export function categoryBelongsToRoute(value, route) {
  const normalized = normalizeVenueCategory(value);
  const routeSection = ROUTE_SECTION_CATEGORY[route];

  if (routeSection) {
    return getVenueSection(normalized) === routeSection;
  }

  return getVenueRoute(normalized) === route;
}

export function isRouteSectionCategory(value, route) {
  const normalized = normalizeVenueCategory(value);
  return Boolean(normalized) && ROUTE_SECTION_CATEGORY[route] === normalized;
}

export function getVenueCategoryByPath(pathname) {
  return VENUE_TYPE_OPTIONS.find((option) => option.route === pathname) || null;
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
