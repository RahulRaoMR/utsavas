export const BOOKING_GST_RATE = 0.18;
export const BOOKING_GST_HSN_CODE = "998599";
export const TALME_INVOICE_COMPANY = Object.freeze({
  legalName: "TALME TECHNOLOGIES PRIVATE LIMITED",
  gstin: "29AAJCT8187F1ZO",
  pan: "AAJCT8187F",
  address:
    "285, 9TH MAIN ROAD, 26TH CROSS, BSK 2ND STAGE, Bengaluru, Bengaluru Urban, Karnataka, 560070",
  state: "Karnataka",
  stateCode: "29",
});
export const BOOKING_CANCELLATION_POLICY = Object.freeze({
  title: "Venue Booking Procedure and Cancellation Policy",
  lines: [
    "Cancellation can only be made 4 months before the event date to avail a full refund of the 50% booking amount.",
    "If cancelled within 4 months from your event date due to any reason, whatever the circumstances and situation may it be, the 50% booking amount will not be refunded.",
    "Remaining 50% of the full amount, if paid, will be refunded.",
  ],
});

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

function formatPercentage(rate) {
  const percentage = Number(rate || 0) * 100;

  if (!Number.isFinite(percentage)) {
    return "0%";
  }

  return Number.isInteger(percentage)
    ? `${percentage}%`
    : `${percentage.toFixed(2).replace(/\.?0+$/, "")}%`;
}

function normalizeStateName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ");
}

export function formatBookingGstLabel({
  gstRate = BOOKING_GST_RATE,
  hsnCode = BOOKING_GST_HSN_CODE,
} = {}) {
  return `GST (${Math.round(getBookingGstRate(gstRate) * 100)}%) - HSN/SAC ${hsnCode || BOOKING_GST_HSN_CODE}`;
}

export function resolveBookingTaxBreakdown({
  taxableAmount = 0,
  gstAmount = 0,
  gstRate = BOOKING_GST_RATE,
  hsnCode = BOOKING_GST_HSN_CODE,
  placeOfSupply = TALME_INVOICE_COMPANY.state,
} = {}) {
  const normalizedTaxableAmount = toSafeAmount(taxableAmount);
  const normalizedGstAmount = toSafeAmount(gstAmount);
  const normalizedGstRate = getBookingGstRate(gstRate);
  const normalizedPlaceOfSupply =
    String(placeOfSupply || "").trim() || TALME_INVOICE_COMPANY.state;
  const isIntraStateSupply =
    normalizeStateName(normalizedPlaceOfSupply) ===
    normalizeStateName(TALME_INVOICE_COMPANY.state);

  if (isIntraStateSupply) {
    const halfRate = normalizedGstRate / 2;
    const cgstAmount =
      normalizedTaxableAmount > 0
        ? Math.round(normalizedTaxableAmount * halfRate)
        : 0;
    const sgstAmount = Math.max(normalizedGstAmount - cgstAmount, 0);

    return {
      placeOfSupply: normalizedPlaceOfSupply,
      taxModeLabel: `CGST ${formatPercentage(halfRate)} + SGST ${formatPercentage(
        halfRate
      )}`,
      taxRows: [
        {
          label: `CGST (${formatPercentage(halfRate)}) - HSN/SAC ${
            hsnCode || BOOKING_GST_HSN_CODE
          }`,
          amount: cgstAmount,
        },
        {
          label: `SGST (${formatPercentage(halfRate)}) - HSN/SAC ${
            hsnCode || BOOKING_GST_HSN_CODE
          }`,
          amount: sgstAmount,
        },
      ],
    };
  }

  return {
    placeOfSupply: normalizedPlaceOfSupply,
    taxModeLabel: `IGST ${formatPercentage(normalizedGstRate)}`,
    taxRows: [
      {
        label: `IGST (${formatPercentage(normalizedGstRate)}) - HSN/SAC ${
          hsnCode || BOOKING_GST_HSN_CODE
        }`,
        amount: normalizedGstAmount,
      },
    ],
  };
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
  const taxBreakdown = resolveBookingTaxBreakdown({
    taxableAmount: storedTaxableAmount,
    gstAmount: storedGstAmount,
    gstRate: resolvedGstRate,
    hsnCode:
      String(booking?.gstHsnCode || BOOKING_GST_HSN_CODE).trim() ||
      BOOKING_GST_HSN_CODE,
    placeOfSupply: booking?.hallAddress?.state || TALME_INVOICE_COMPANY.state,
  });

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
    placeOfSupply: taxBreakdown.placeOfSupply,
    taxModeLabel: taxBreakdown.taxModeLabel,
    taxRows: taxBreakdown.taxRows,
  };
}
