"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toAbsoluteImageUrl } from "../../../../lib/imageUrl";
import {
  formatBookingGstLabel,
  resolveStoredBookingInvoiceBreakdown,
} from "../../../../lib/bookingInvoice";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingDateTime,
  formatBookingWindow,
} from "../../../../lib/bookingSchedule";
import styles from "./booking-detail.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const LOGIN_REDIRECT_PREFIX = "/login?redirect=";

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "-";

const formatAddress = (address = {}) =>
  [
    address.flat,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

const getStatusBadgeClass = (value) => {
  if (value === "approved" || value === "paid") return styles.badgeSuccess;
  if (value === "failed" || value === "rejected") return styles.badgeDanger;
  return styles.badgePending;
};

const getPaymentNote = (booking) => {
  if (booking.paymentStatus === "paid") {
    return "Your payment has been received successfully for this booking.";
  }

  if (booking.paymentStatus === "failed") {
    return "The payment attempt did not go through. Please contact support or the venue partner if you need help.";
  }

  if (booking.paymentMethod === "pay_at_venue") {
    return "This booking is marked as pay at venue. The amount below is still pending until it is collected.";
  }

  return "This booking is still awaiting payment confirmation.";
};

export default function MyBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace(
        `${LOGIN_REDIRECT_PREFIX}${encodeURIComponent(`/my-bookings/${bookingId}`)}`
      );
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/api/bookings/me/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace(
            `${LOGIN_REDIRECT_PREFIX}${encodeURIComponent(
              `/my-bookings/${bookingId}`
            )}`
          );
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load booking details");
        }

        setBooking(data);
      } catch (fetchError) {
        console.error("Failed to load booking details:", fetchError);
        setError(fetchError.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const summary = useMemo(() => {
    if (!booking) {
      return {
        amountPaid: 0,
        amountPending: 0,
        bookingWindow: "-",
        venueImage: "/dashboard/banquet.jpg",
        address: "",
        invoice: resolveStoredBookingInvoiceBreakdown({}),
      };
    }

    const invoice = resolveStoredBookingInvoiceBreakdown(booking);
    const totalAmount = Number(invoice.totalAmount) || 0;
    const amountPaid = booking.paymentStatus === "paid" ? totalAmount : 0;
    const amountPending = booking.paymentStatus === "paid" ? 0 : totalAmount;

    return {
      amountPaid,
      amountPending,
      bookingWindow: formatBookingWindow(booking),
      venueImage: booking.hallImages?.[0]
        ? toAbsoluteImageUrl(booking.hallImages[0])
        : "/dashboard/banquet.jpg",
      address: formatAddress(booking.hallAddress),
      invoice,
    };
  }, [booking]);

  if (loading) {
    return (
      <div className={styles.statePage}>
        <p className={styles.stateText}>Loading booking summary...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.statePage}>
        <div className={styles.stateCard}>
          <h1>Booking summary unavailable</h1>
          <p>{error || "We could not load this booking right now."}</p>
          <Link href="/my-bookings" className={styles.backLinkButton}>
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/my-bookings" className={styles.backLink}>
          Back to My Bookings
        </Link>
        <p className={styles.reference}>
          Booking Ref: <strong>{booking.bookingReference || booking._id}</strong>
        </p>
      </div>

      <section className={styles.heroCard}>
        <div className={styles.imageWrap}>
          <Image
            src={summary.venueImage}
            alt={booking.hallName || "Venue"}
            fill
            className={styles.heroImage}
            sizes="(max-width: 900px) 100vw, 360px"
          />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Order Summary</p>
          <h1>{booking.hallName || "Venue Booking"}</h1>
          <p className={styles.heroMeta}>
            {booking.eventType || "Event"} . {summary.bookingWindow}
          </p>
          <p className={styles.heroAddress}>
            {summary.address || "Venue address will be shared by the partner."}
          </p>

          <div className={styles.badgeRow}>
            <span
              className={`${styles.statusBadge} ${getStatusBadgeClass(
                booking.status
              )}`}
            >
              Booking: {formatLabel(booking.status)}
            </span>
            <span
              className={`${styles.statusBadge} ${getStatusBadgeClass(
                booking.paymentStatus
              )}`}
            >
              Payment: {formatLabel(booking.paymentStatus)}
            </span>
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h2>Booking Details</h2>
            <div className={styles.detailGrid}>
              <div>
                <span>Booking status</span>
                <strong>{formatLabel(booking.status)}</strong>
              </div>
              <div>
                <span>Payment status</span>
                <strong>{formatLabel(booking.paymentStatus)}</strong>
              </div>
              <div>
                <span>Payment method</span>
                <strong>{formatLabel(booking.paymentMethod)}</strong>
              </div>
              <div>
                <span>Pricing basis</span>
                <strong>{booking.pricingBasis || "Venue pricing"}</strong>
              </div>
              <div>
                <span>Check-in</span>
                <strong>
                  {formatBookingDateTime(
                    booking.checkIn,
                    booking.checkInTime,
                    "-",
                    DEFAULT_CHECK_IN_TIME
                  )}
                </strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>
                  {formatBookingDateTime(
                    booking.checkOut,
                    booking.checkOutTime,
                    "-",
                    DEFAULT_CHECK_OUT_TIME
                  )}
                </strong>
              </div>
              <div>
                <span>Event schedule</span>
                <strong>{summary.bookingWindow}</strong>
              </div>
              <div>
                <span>Booked on</span>
                <strong>{formatDateTime(booking.createdAt)}</strong>
              </div>
              <div>
                <span>Guests</span>
                <strong>{booking.guests || "To be confirmed"}</strong>
              </div>
              <div>
                <span>Coupon</span>
                <strong>{booking.couponCode || "No coupon applied"}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Customer Details</h2>
            <div className={styles.detailGrid}>
              <div>
                <span>Name</span>
                <strong>{booking.customerName || "-"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{booking.customerEmail || "-"}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{booking.phone || "-"}</strong>
              </div>
              <div>
                <span>Event type</span>
                <strong>{booking.eventType || "-"}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Venue Partner Details</h2>
            <div className={styles.detailGrid}>
              <div>
                <span>Venue partner</span>
                <strong>{booking.vendorName || "Venue Partner"}</strong>
              </div>
              <div>
                <span>Owner name</span>
                <strong>{booking.vendorOwnerName || "-"}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{booking.vendorPhone || "-"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{booking.vendorEmail || "-"}</strong>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={`${styles.card} ${styles.summaryCard}`}>
            <h2>Amount Summary</h2>

            <div className={styles.summaryRow}>
              <span>Venue amount</span>
              <strong>{formatCurrency(summary.invoice.venueAmount)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Coupon discount</span>
              <strong className={styles.discountValue}>
                - {formatCurrency(summary.invoice.discountAmount)}
              </strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Taxable value</span>
              <strong>{formatCurrency(summary.invoice.taxableAmount)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>
                {formatBookingGstLabel({
                  gstRate: summary.invoice.gstRate,
                  hsnCode: summary.invoice.gstHsnCode,
                })}
              </span>
              <strong>{formatCurrency(summary.invoice.gstAmount)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Total bill</span>
              <strong>{formatCurrency(summary.invoice.totalAmount)}</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryHighlight}`}>
              <span>Amount paid</span>
              <strong>{formatCurrency(summary.amountPaid)}</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryHighlight}`}>
              <span>Amount pending</span>
              <strong>{formatCurrency(summary.amountPending)}</strong>
            </div>

            <div className={styles.noteBox}>
              <strong>Payment note</strong>
              <p>{getPaymentNote(booking)}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
