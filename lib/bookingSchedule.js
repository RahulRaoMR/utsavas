const TIME_24_HOUR_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_CHECK_IN_TIME = "09:00";
export const DEFAULT_CHECK_OUT_TIME = "21:00";

export function normalizeBookingTime(value) {
  const normalized = String(value || "").trim();
  return TIME_24_HOUR_REGEX.test(normalized) ? normalized : "";
}

function extractBookingDateParts(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (DATE_INPUT_REGEX.test(normalizedValue)) {
    const [year, month, day] = normalizedValue.split("-").map(Number);

    return {
      year,
      monthIndex: month - 1,
      day,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    day: date.getDate(),
  };
}

export function formatDateInputValue(value, fallback = "") {
  const parts = extractBookingDateParts(value);

  if (!parts) {
    return fallback;
  }

  return [
    String(parts.year).padStart(4, "0"),
    String(parts.monthIndex + 1).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

export function buildBookingDateTime(
  dateValue,
  timeValue,
  {
    fallbackTime = "",
    endOfDay = false,
  } = {}
) {
  const parts = extractBookingDateParts(dateValue);

  if (!parts) {
    return null;
  }

  const normalizedTime =
    normalizeBookingTime(timeValue) || normalizeBookingTime(fallbackTime);

  if (!normalizedTime) {
    if (!endOfDay) {
      return null;
    }

    return new Date(
      parts.year,
      parts.monthIndex,
      parts.day,
      23,
      59,
      59,
      999
    );
  }

  const [hours, minutes] = normalizedTime.split(":").map(Number);

  return new Date(
    parts.year,
    parts.monthIndex,
    parts.day,
    hours,
    minutes,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );
}

export function rangesOverlap(startA, endA, startB, endB) {
  if (
    !(startA instanceof Date) ||
    !(endA instanceof Date) ||
    !(startB instanceof Date) ||
    !(endB instanceof Date)
  ) {
    return false;
  }

  if (
    Number.isNaN(startA.getTime()) ||
    Number.isNaN(endA.getTime()) ||
    Number.isNaN(startB.getTime()) ||
    Number.isNaN(endB.getTime())
  ) {
    return false;
  }

  return startA < endB && endA > startB;
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
      hour12: true,
    });
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
