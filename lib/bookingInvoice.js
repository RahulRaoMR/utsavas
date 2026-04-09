export const BOOKING_GST_RATE = 0.18;
export const BOOKING_GST_HSN_CODE = "998599";

function toSafeAmount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
}

function hasFiniteNonNegativeAmount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0;
}

export function getBookingGstRate(value, fallback = BOOKING_GST_RATE) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

export function formatBookingGstLabel({
  gstRate = BOOKING_GST_RATE,
  hsnCode = BOOKING_GST_HSN_CODE,
} = {}) {
  return `GST (${Math.round(getBookingGstRate(gstRate) * 100)}%) - HSN/SAC ${hsnCode || BOOKING_GST_HSN_CODE}`;
}

export function calculateBookingInvoiceBreakdown({
  venueAmount = 0,
  discountAmount = 0,
  gstRate = BOOKING_GST_RATE,
} = {}) {
  const normalizedVenueAmount = toSafeAmount(venueAmount);
  const normalizedDiscountAmount = Math.min(
    toSafeAmount(discountAmount),
    normalizedVenueAmount
  );
  const normalizedGstRate = getBookingGstRate(gstRate);
  const taxableAmount = Math.max(
    normalizedVenueAmount - normalizedDiscountAmount,
    0
  );
  const gstAmount =
    taxableAmount > 0 ? Math.round(taxableAmount * normalizedGstRate) : 0;
  const totalAmount = taxableAmount + gstAmount;

  return {
    venueAmount: normalizedVenueAmount,
    discountAmount: normalizedDiscountAmount,
    taxableAmount,
    gstRate: normalizedGstRate,
    gstAmount,
    totalAmount,
    gstHsnCode: BOOKING_GST_HSN_CODE,
  };
}

export function resolveStoredBookingInvoiceBreakdown(booking = {}) {
  const computedBreakdown = calculateBookingInvoiceBreakdown({
    venueAmount: booking?.venueAmount,
    discountAmount: booking?.discountAmount,
    gstRate: booking?.gstRate,
  });

  const storedTaxableAmount =
    hasFiniteNonNegativeAmount(booking?.taxableAmount)
      ? Number(booking.taxableAmount)
      : hasFiniteNonNegativeAmount(booking?.subtotalAmount) &&
        Number(booking.subtotalAmount) <= computedBreakdown.venueAmount
      ? Number(booking.subtotalAmount)
      : computedBreakdown.taxableAmount;

  const storedGstAmount = hasFiniteNonNegativeAmount(booking?.supportFee)
    ? Number(booking.supportFee)
    : computedBreakdown.gstAmount;

  const resolvedGstRate = getBookingGstRate(
    booking?.gstRate,
    storedTaxableAmount > 0 && storedGstAmount > 0
      ? storedGstAmount / storedTaxableAmount
      : BOOKING_GST_RATE
  );

  const storedTotalAmount = hasFiniteNonNegativeAmount(booking?.amount)
    ? Number(booking.amount)
    : storedTaxableAmount + storedGstAmount;

  return {
    venueAmount: computedBreakdown.venueAmount,
    discountAmount: computedBreakdown.discountAmount,
    taxableAmount: storedTaxableAmount,
    gstAmount: storedGstAmount,
    totalAmount: storedTotalAmount,
    gstRate: resolvedGstRate,
    gstHsnCode:
      String(booking?.gstHsnCode || BOOKING_GST_HSN_CODE).trim() ||
      BOOKING_GST_HSN_CODE,
  };
}
