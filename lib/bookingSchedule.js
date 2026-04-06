const TIME_24_HOUR_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DEFAULT_CHECK_IN_TIME = "09:00";
export const DEFAULT_CHECK_OUT_TIME = "21:00";

export function normalizeBookingTime(value) {
  const normalized = String(value || "").trim();
  return TIME_24_HOUR_REGEX.test(normalized) ? normalized : "";
}

export function formatBookingDate(
  value,
  options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
  fallback = "-"
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("en-IN", options);
}

export function formatBookingTime(value, fallback = "Time not shared") {
  const normalized = normalizeBookingTime(value);

  if (!normalized) {
    const fallbackTime = normalizeBookingTime(fallback);

    if (!fallbackTime) {
      return fallback;
    }

    const [fallbackHours, fallbackMinutes] = fallbackTime.split(":").map(Number);
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackHours, fallbackMinutes, 0, 0);

    return fallbackDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBookingDateTime(
  dateValue,
  timeValue,
  fallback = "-",
  fallbackTime = DEFAULT_CHECK_IN_TIME
) {
  const formattedDate = formatBookingDate(dateValue, undefined, fallback);

  if (formattedDate === fallback) {
    return fallback;
  }

  return `${formattedDate}, ${formatBookingTime(
    timeValue,
    fallbackTime
  )}`;
}

export function formatBookingWindow(booking, fallback = "-") {
  const formattedCheckInDate = formatBookingDate(booking?.checkIn, undefined, fallback);
  const formattedCheckOutDate = formatBookingDate(booking?.checkOut, undefined, fallback);

  if (formattedCheckInDate === fallback || formattedCheckOutDate === fallback) {
    return fallback;
  }

  const checkInLabel = `${formattedCheckInDate}, ${formatBookingTime(
    booking?.checkInTime,
    DEFAULT_CHECK_IN_TIME
  )}`;
  const checkOutLabel = `${formattedCheckOutDate}, ${formatBookingTime(
    booking?.checkOutTime,
    DEFAULT_CHECK_OUT_TIME
  )}`;

  return `${checkInLabel} to ${checkOutLabel}`;
}
