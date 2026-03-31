const CART_STORAGE_KEY = "utsavasHallCart";
export const CART_UPDATED_EVENT = "utsavas-cart-updated";
const EMPTY_CART = [];

let cachedCartRaw = null;
let cachedCartItems = EMPTY_CART;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function emitCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

function readCart() {
  if (!canUseStorage()) {
    return EMPTY_CART;
  }

  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY) || "[]";

    if (rawCart === cachedCartRaw) {
      return cachedCartItems;
    }

    const parsed = JSON.parse(rawCart);
    cachedCartRaw = rawCart;
    cachedCartItems = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedCartItems;
  } catch {
    cachedCartRaw = "[]";
    cachedCartItems = EMPTY_CART;
    return cachedCartItems;
  }
}

function writeCart(items) {
  if (!canUseStorage()) {
    return EMPTY_CART;
  }

  const nextItems = Array.isArray(items) ? items : EMPTY_CART;
  cachedCartRaw = JSON.stringify(nextItems);
  cachedCartItems = nextItems;
  localStorage.setItem(CART_STORAGE_KEY, cachedCartRaw);
  emitCartUpdated();
  return nextItems;
}

function buildCartHall(hall) {
  const hallId = String(hall?._id || hall?.id || "").trim();

  if (!hallId) {
    return null;
  }

  return {
    _id: hallId,
    hallName: String(hall?.hallName || "Venue"),
    category: String(hall?.category || ""),
    images: Array.isArray(hall?.images) ? hall.images.filter(Boolean) : [],
    features:
      hall?.features && typeof hall.features === "object" ? { ...hall.features } : {},
    address:
      hall?.address && typeof hall.address === "object" ? { ...hall.address } : {},
    capacity: Number(hall?.capacity || 0),
    parkingCapacity: Number(hall?.parkingCapacity || 0),
    rooms: Number(hall?.rooms || 0),
    pricePerEvent: Number(hall?.pricePerEvent || 0),
    pricePerDay: Number(hall?.pricePerDay || 0),
    pricePerPlate: Number(hall?.pricePerPlate || 0),
    addedAt: new Date().toISOString(),
  };
}

export function getHallCart() {
  return readCart();
}

export function getHallCartCount() {
  return readCart().length;
}

export function isHallInCart(hallId) {
  const normalizedHallId = String(hallId || "").trim();

  if (!normalizedHallId) {
    return false;
  }

  return readCart().some((item) => String(item?._id || "") === normalizedHallId);
}

export function addHallToCart(hall) {
  const cartHall = buildCartHall(hall);
  const currentItems = readCart();

  if (!cartHall) {
    return { added: false, item: null, items: currentItems };
  }

  if (currentItems.some((item) => String(item?._id || "") === cartHall._id)) {
    return { added: false, item: cartHall, items: currentItems };
  }

  const nextItems = [cartHall, ...currentItems];
  writeCart(nextItems);

  return { added: true, item: cartHall, items: nextItems };
}

export function removeHallFromCart(hallId) {
  const normalizedHallId = String(hallId || "").trim();
  const currentItems = readCart();
  const nextItems = currentItems.filter(
    (item) => String(item?._id || "") !== normalizedHallId
  );

  if (nextItems.length === currentItems.length) {
    return { removed: false, items: currentItems };
  }

  writeCart(nextItems);
  return { removed: true, items: nextItems };
}

export function clearHallCart() {
  writeCart([]);
}
