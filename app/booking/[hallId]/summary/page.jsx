"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./summary.module.css";
import { toAbsoluteImageUrl } from "../../../../lib/imageUrl";
import { getVenueCategoryLabel } from "../../../../lib/venueCategories";
import {
  BOOKING_CANCELLATION_POLICY,
  BOOKING_GST_HSN_CODE,
  BOOKING_GST_RATE,
  TALME_INVOICE_COMPANY,
  calculateBookingInvoiceBreakdown,
  resolveBookingTaxBreakdown,
} from "../../../../lib/bookingInvoice";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingDateTime,
  formatBookingWindow,
  normalizeBookingTime,
} from "../../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";
const BOOKING_DRAFT_STORAGE_KEY = "utsavas-booking-draft";

const COUPONS = {
  UTSAVAS10: {
    label: "10% off on your booking value",
    apply(subtotal) {
      return Math.min(Math.round(subtotal * 0.1), 5000);
    },
  },
  WELCOME500: {
    label: "Flat Rs 500 off on first checkout",
    apply(subtotal) {
      return subtotal >= 5000 ? 500 : 0;
    },
  },
  FESTIVE15: {
    label: "15% festive savings up to Rs 7,500",
    apply(subtotal) {
      return Math.min(Math.round(subtotal * 0.15), 7500);
    },
  },
};

function getDraftKey(hallId) {
  return `${BOOKING_DRAFT_STORAGE_KEY}:${hallId}`;
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function parsePrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function resolveVenuePricing(hall, booking) {
  const selectedDays = calculateNights(booking.checkIn, booking.checkOut);
  const guests = Number(booking.guests) || 0;
  const pricePerEvent = parsePrice(hall.pricePerEvent);
  const pricePerDay = parsePrice(hall.pricePerDay);
  const pricePerPlate = parsePrice(hall.pricePerPlate);

  if (selectedDays <= 1 && pricePerEvent > 0) {
    return {
      venuePrice: pricePerEvent,
      pricingBasis: "Per event package",
      pricingDescription: `${formatCurrency(pricePerEvent)} x 1 event`,
      unitPrice: pricePerEvent,
      unitLabel: "event",
      unitCount: 1,
      selectedDays,
    };
  }

  if (selectedDays > 1 && pricePerDay > 0) {
    return {
      venuePrice: pricePerDay * selectedDays,
      pricingBasis: "Per day tariff",
      pricingDescription: `${formatCurrency(pricePerDay)} x ${selectedDays} days`,
      unitPrice: pricePerDay,
      unitLabel: "day",
      unitCount: selectedDays,
      selectedDays,
    };
  }

  if (pricePerEvent > 0) {
    return {
      venuePrice: pricePerEvent,
      pricingBasis: "Per event package",
      pricingDescription: `${formatCurrency(pricePerEvent)} x 1 event`,
      unitPrice: pricePerEvent,
      unitLabel: "event",
      unitCount: 1,
      selectedDays,
    };
  }

  if (pricePerDay > 0) {
    return {
      venuePrice: pricePerDay * selectedDays,
      pricingBasis: "Per day tariff",
      pricingDescription: `${formatCurrency(pricePerDay)} x ${selectedDays} days`,
      unitPrice: pricePerDay,
      unitLabel: "day",
      unitCount: selectedDays,
      selectedDays,
    };
  }

  if (pricePerPlate > 0) {
    const billedGuests = Math.max(guests, 1);

    return {
      venuePrice: pricePerPlate * billedGuests,
      pricingBasis: "Per plate pricing",
      pricingDescription: `${formatCurrency(pricePerPlate)} x ${billedGuests} guests`,
      unitPrice: pricePerPlate,
      unitLabel: "guest",
      unitCount: billedGuests,
      selectedDays,
    };
  }

  return {
    venuePrice: 0,
    pricingBasis: "Custom venue quote",
    pricingDescription: "Venue owner will confirm the final amount",
    unitPrice: 0,
    unitLabel: "custom",
    unitCount: 0,
    selectedDays,
  };
}

function formatCurrency(amount) {
  return `Rs ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function buildAddress(address = {}) {
  return [
    address.flat,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function BookingSummaryPage() {
  const { hallId } = useParams();
  const router = useRouter();

  const [draft, setDraft] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/booking/${hallId}`)}`);
      return;
    }

    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(getDraftKey(hallId))
        : null;

    if (!stored) {
      router.replace(`/booking/${hallId}`);
      return;
    }

    try {
      const parsedDraft = JSON.parse(stored);
      const normalizedDraft = {
        ...parsedDraft,
        booking: {
          ...(parsedDraft?.booking || {}),
          checkInTime:
            normalizeBookingTime(parsedDraft?.booking?.checkInTime) ||
            DEFAULT_CHECK_IN_TIME,
          checkOutTime:
            normalizeBookingTime(parsedDraft?.booking?.checkOutTime) ||
            DEFAULT_CHECK_OUT_TIME,
        },
      };

      setDraft(normalizedDraft);
      sessionStorage.setItem(getDraftKey(hallId), JSON.stringify(normalizedDraft));
    } catch (error) {
      console.error("Invalid booking draft", error);
      router.replace(`/booking/${hallId}`);
    }
  }, [hallId, router]);

  const pricing = useMemo(() => {
    if (!draft?.hall || !draft?.booking) {
      return {
        nights: 1,
        venuePrice: 0,
        taxableAmount: 0,
        gstAmount: 0,
        discount: 0,
        totalAmount: 0,
        pricingBasis: "Custom venue quote",
        pricingDescription: "",
        unitPrice: 0,
        unitLabel: "custom",
        unitCount: 0,
        gstRate: BOOKING_GST_RATE,
        gstHsnCode: BOOKING_GST_HSN_CODE,
        placeOfSupply: TALME_INVOICE_COMPANY.state,
        taxModeLabel: "CGST 9% + SGST 9%",
        taxRows: [],
      };
    }

    const pricingRule = resolveVenuePricing(draft.hall, draft.booking);
    const nights = pricingRule.selectedDays;
    const venuePrice = pricingRule.venuePrice;
    const discount = appliedCoupon
      ? Math.min(COUPONS[appliedCoupon]?.apply(venuePrice) || 0, venuePrice)
      : 0;
    const invoice = calculateBookingInvoiceBreakdown({
      venueAmount: venuePrice,
      discountAmount: discount,
      gstRate: BOOKING_GST_RATE,
    });
    const taxBreakdown = resolveBookingTaxBreakdown({
      taxableAmount: invoice.taxableAmount,
      gstAmount: invoice.gstAmount,
      gstRate: invoice.gstRate,
      hsnCode: invoice.gstHsnCode,
      placeOfSupply: draft.hall?.address?.state || TALME_INVOICE_COMPANY.state,
    });

    return {
      nights,
      venuePrice,
      taxableAmount: invoice.taxableAmount,
      gstAmount: invoice.gstAmount,
      discount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      pricingBasis: pricingRule.pricingBasis,
      pricingDescription: pricingRule.pricingDescription,
      unitPrice: pricingRule.unitPrice,
      unitLabel: pricingRule.unitLabel,
      unitCount: pricingRule.unitCount,
      gstRate: invoice.gstRate,
      gstHsnCode: invoice.gstHsnCode,
      placeOfSupply: taxBreakdown.placeOfSupply,
      taxModeLabel: taxBreakdown.taxModeLabel,
      taxRows: taxBreakdown.taxRows,
    };
  }, [appliedCoupon, draft]);

  const applyCouponCode = (rawCode) => {
    const normalized = rawCode.trim().toUpperCase();

    if (!normalized) {
      setAppliedCoupon("");
      setCouponMessage("Enter a coupon code to apply a discount.");
      return;
    }

    const coupon = COUPONS[normalized];

    if (!coupon) {
      setAppliedCoupon("");
      setCouponMessage("This coupon is not available right now.");
      return;
    }

    const discount = coupon.apply(pricing.venuePrice);

    if (discount <= 0) {
      setAppliedCoupon("");
      setCouponMessage("This coupon does not apply to the current booking total.");
      return;
    }

    setAppliedCoupon(normalized);
    setCouponMessage(`${coupon.label}. You saved ${formatCurrency(discount)}.`);
  };

  const applyCoupon = () => {
    applyCouponCode(couponInput);
  };

  const handleContinue = async () => {
    if (!draft?.booking) {
      router.replace(`/booking/${hallId}`);
      return;
    }

    try {
      setSubmitting(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const storedUser =
        typeof window !== "undefined" ? localStorage.getItem("user") : "";
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const res = await fetch(`${API}/api/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          hallId,
          checkIn: draft.booking.checkIn,
          checkInTime: draft.booking.checkInTime,
          checkOut: draft.booking.checkOut,
          checkOutTime: draft.booking.checkOutTime,
          eventType: draft.booking.eventType,
          guests: Number(draft.booking.guests) || 0,
          customerName: draft.booking.customerName,
          phone: draft.booking.phone,
          customerEmail: parsedUser?.email || "",
          amount: pricing.totalAmount,
          venueAmount: pricing.venuePrice,
          taxableAmount: pricing.taxableAmount,
          supportFee: pricing.gstAmount,
          subtotalAmount: pricing.taxableAmount,
          discountAmount: pricing.discount,
          couponCode: appliedCoupon,
          pricingBasis: pricing.pricingBasis,
          gstRate: pricing.gstRate,
          gstHsnCode: pricing.gstHsnCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      const bookingId = data?.booking?._id;

      if (!bookingId) {
        throw new Error("Booking reference missing");
      }

      const createdBooking = data?.booking || {};
      const nextAmount = parsePrice(createdBooking.amount) || pricing.totalAmount;
      const nextBaseAmount =
        parsePrice(createdBooking.taxableAmount) ||
        parsePrice(createdBooking.subtotalAmount) ||
        pricing.taxableAmount;
      const nextGstAmount =
        parsePrice(createdBooking.supportFee) || pricing.gstAmount;
      const nextDiscount =
        parsePrice(createdBooking.discountAmount) || pricing.discount;
      const nextCouponCode = createdBooking.couponCode || appliedCoupon;
      const nextGstRate = Number(createdBooking.gstRate) || pricing.gstRate;
      const nextGstHsnCode = createdBooking.gstHsnCode || pricing.gstHsnCode;

      router.push(
        `/booking/${hallId}/payment?bookingId=${encodeURIComponent(
          bookingId
        )}&amount=${nextAmount}&baseAmount=${nextBaseAmount}&gstAmount=${nextGstAmount}&discount=${nextDiscount}&coupon=${encodeURIComponent(
          nextCouponCode
        )}&gstRate=${encodeURIComponent(nextGstRate)}&hsn=${encodeURIComponent(
          nextGstHsnCode
        )}&placeOfSupply=${encodeURIComponent(
          draft.hall?.address?.state || TALME_INVOICE_COMPANY.state
        )}`
      );
    } catch (error) {
      alert(error.message || "Unable to continue to payment right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft?.hall || !draft?.booking) {
    return <p className={styles.loading}>Preparing your order summary...</p>;
  }

  const venueImage = draft.hall.images?.[0]
    ? toAbsoluteImageUrl(draft.hall.images[0])
    : "/dashboard/banquet.jpg";
  const categoryLabel =
    getVenueCategoryLabel(draft.hall.category) || draft.hall.category || "Venue";
  const bookingWindow = formatBookingWindow(draft.booking, "Not selected");
  const activeCouponLabel = appliedCoupon ? COUPONS[appliedCoupon]?.label : "";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.heroEyebrow}>Booking Summary</p>
          <h1>Review your event schedule before payment</h1>
          <p className={styles.heroText}>
            Confirm venue details, exact timings, apply a coupon, and check
            your final amount before you move to payment.
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <article className={styles.card}>
            <div className={styles.venueHeader}>
              <img
                src={venueImage}
                alt={draft.hall.hallName}
                className={styles.venueImage}
                onError={(event) => {
                  event.currentTarget.src = "/dashboard/banquet.jpg";
                }}
              />
              <div className={styles.venueCopy}>
                <p className={styles.badge}>{categoryLabel}</p>
                <h2>{draft.hall.hallName}</h2>
                <p>{buildAddress(draft.hall.address) || "Venue address unavailable"}</p>
                <div className={styles.metaRow}>
                  <span>{draft.booking.eventType}</span>
                  <span>{draft.booking.guests || "N/A"} guests</span>
                  <span>{pricing.nights} day{pricing.nights > 1 ? "s" : ""}</span>
                  <span>
                    Up to {draft.hall.capacity ? `${draft.hall.capacity} capacity` : "Capacity on request"}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <h3>Booking details</h3>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.label}>Check-in</span>
                <strong>
                  {formatBookingDateTime(
                    draft.booking.checkIn,
                    draft.booking.checkInTime,
                    "-",
                    DEFAULT_CHECK_IN_TIME
                  )}
                </strong>
              </div>
              <div>
                <span className={styles.label}>Check-out</span>
                <strong>
                  {formatBookingDateTime(
                    draft.booking.checkOut,
                    draft.booking.checkOutTime,
                    "-",
                    DEFAULT_CHECK_OUT_TIME
                  )}
                </strong>
              </div>
              <div>
                <span className={styles.label}>Event type</span>
                <strong>{draft.booking.eventType}</strong>
              </div>
              <div>
                <span className={styles.label}>Guest name</span>
                <strong>{draft.booking.customerName}</strong>
              </div>
              <div>
                <span className={styles.label}>Phone</span>
                <strong>{draft.booking.phone}</strong>
              </div>
              <div>
                <span className={styles.label}>Guests</span>
                <strong>{draft.booking.guests || "To be confirmed"}</strong>
              </div>
              <div>
                  <span className={styles.label}>Pricing basis</span>
                <strong>{pricing.pricingBasis}</strong>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <h3>Apply coupon</h3>
            <div className={styles.couponList}>
              {Object.entries(COUPONS).map(([code, coupon]) => (
                <button
                  key={code}
                  type="button"
                  className={`${styles.couponChip} ${
                    appliedCoupon === code ? styles.couponChipActive : ""
                  }`}
                  onClick={() => {
                    setCouponInput(code);
                    applyCouponCode(code);
                  }}
                >
                  <strong>{code}</strong>
                  <span>{coupon.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.couponRow}>
              <input
                type="text"
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="Try UTSAVAS10 or WELCOME500"
                className={styles.couponInput}
              />
              <button type="button" onClick={applyCoupon} className={styles.applyButton}>
                Apply
              </button>
            </div>
            <p className={styles.couponMessage}>
              {couponMessage || "Use a valid code to unlock instant savings."}
            </p>
          </article>

          <article className={styles.card}>
            <h3>Booking benefits</h3>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <strong>Instant review before payment</strong>
                <p>
                  Double-check your event dates, contact details, and venue pricing
                  before the payment step.
                </p>
              </div>
              <div className={styles.benefitItem}>
                <strong>Flexible payment choice</strong>
                <p>
                  You can continue with online payment now or confirm the request
                  and choose pay-at-venue on the next screen.
                </p>
              </div>
              <div className={styles.benefitItem}>
                <strong>Secure booking record</strong>
                <p>
                  Your booking request is created only when you continue, so you
                  stay in control until the final step.
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className={styles.sidebar}>
          <article className={`${styles.card} ${styles.stickyCard}`}>
            <h3>Price details</h3>
            <div className={styles.rateBanner}>
              <span>Calculated from venue pricing</span>
              <strong>{pricing.pricingDescription}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Venue amount</span>
              <strong>{formatCurrency(pricing.venuePrice)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Coupon discount</span>
              <strong className={styles.discountValue}>
                - {formatCurrency(pricing.discount)}
              </strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Taxable value</span>
              <strong>{formatCurrency(pricing.taxableAmount)}</strong>
            </div>
            {pricing.taxRows.map((taxRow) => (
              <div className={styles.summaryRow} key={taxRow.label}>
                <span>{taxRow.label}</span>
                <strong>{formatCurrency(taxRow.amount)}</strong>
              </div>
            ))}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total bill</span>
              <strong>{formatCurrency(pricing.totalAmount)}</strong>
            </div>

            <div className={styles.bookingSnapshot}>
              <span>Selected schedule</span>
              <strong>{bookingWindow}</strong>
            </div>
            <div className={styles.bookingSnapshot}>
              <span>Booking for</span>
              <strong>{draft.booking.customerName}</strong>
            </div>
            <div className={styles.bookingSnapshot}>
              <span>Coupon</span>
              <strong>{appliedCoupon || "No coupon applied"}</strong>
            </div>

            <div className={styles.noteBox}>
              <strong>What happens next?</strong>
              <p>
                After this, you will choose whether to pay online now or pay at
                the venue. Your booking request is created only when you
                continue.
              </p>
            </div>

            <div className={styles.noteBox}>
              <strong>Tax invoice details</strong>
              <p>{TALME_INVOICE_COMPANY.legalName}</p>
              <p>GSTIN: {TALME_INVOICE_COMPANY.gstin}</p>
              <p>PAN: {TALME_INVOICE_COMPANY.pan}</p>
              <p>HSN/SAC: {pricing.gstHsnCode}</p>
              <p>Place of supply: {pricing.placeOfSupply}</p>
              <p>{TALME_INVOICE_COMPANY.address}</p>
            </div>

            <div className={styles.noteBox}>
              <strong>{BOOKING_CANCELLATION_POLICY.title}</strong>
              {BOOKING_CANCELLATION_POLICY.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            {activeCouponLabel ? (
              <p className={styles.inlineNote}>
                Applied offer: <strong>{appliedCoupon}</strong> - {activeCouponLabel}
              </p>
            ) : null}

            <p className={styles.inlineNote}>
              Invoice rule: Venue amount - coupon discount = taxable value.
              {` `}
              {pricing.taxModeLabel} (HSN/SAC {pricing.gstHsnCode})
              {` `}
              is added on the taxable value to calculate the total bill.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleContinue}
              disabled={submitting}
            >
              {submitting ? "Creating booking..." : "Continue to Payment"}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.back()}
            >
              Back to Edit
            </button>
          </article>
        </aside>
      </div>
    </div>
  );
}
