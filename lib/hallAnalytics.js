import { getApiBaseUrl } from "./api";

const STORAGE_PREFIX = "utsavas-hall-analytics";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getStorageKey = (hallId, eventType) =>
  `${STORAGE_PREFIX}:${eventType}:${hallId}:${getTodayKey()}`;

export function shouldTrackHallAnalyticsEvent(hallId, eventType) {
  if (typeof window === "undefined" || !hallId || !eventType) {
    return false;
  }

  return localStorage.getItem(getStorageKey(hallId, eventType)) !== "1";
}

export function markHallAnalyticsEventTracked(hallId, eventType) {
  if (typeof window === "undefined" || !hallId || !eventType) {
    return;
  }

  localStorage.setItem(getStorageKey(hallId, eventType), "1");
}

export async function trackHallView(hallId) {
  if (!shouldTrackHallAnalyticsEvent(hallId, "view")) {
    return false;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/halls/${hallId}/analytics/hall-view`, {
      method: "POST",
      keepalive: true,
    });

    if (!res.ok) {
      return false;
    }

    markHallAnalyticsEventTracked(hallId, "view");
    return true;
  } catch (error) {
    console.error("Failed to track hall view", error);
    return false;
  }
}

export async function trackHallPhoneView(hallId) {
  if (!shouldTrackHallAnalyticsEvent(hallId, "phone-view")) {
    return false;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/halls/${hallId}/analytics/phone-view`, {
      method: "POST",
      keepalive: true,
    });

    if (!res.ok) {
      return false;
    }

    markHallAnalyticsEventTracked(hallId, "phone-view");
    return true;
  } catch (error) {
    console.error("Failed to track phone view", error);
    return false;
  }
}
