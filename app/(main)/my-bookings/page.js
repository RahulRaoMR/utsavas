"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../profile/profile.module.css";
import { clearUserSession } from "../../../lib/authRedirect";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const LOGIN_REDIRECT = "/login?redirect=%2Fmy-bookings";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "-";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace(LOGIN_REDIRECT);
      return;
    }

    const fetchMyBookings = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API}/api/bookings/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          clearUserSession();
          router.replace(LOGIN_REDIRECT);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [router]);

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1>My Bookings</h1>
        <p className={styles.empty}>
          View all your venue bookings, payment status, and order summaries in
          one place.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Booking History</h2>

        {loading && <p className={styles.loading}>Loading your bookings...</p>}

        {!loading && bookings.length === 0 && (
          <p className={styles.empty}>
            No bookings found yet for this account.
          </p>
        )}

        {!loading &&
          bookings.map((booking) => (
            <Link
              key={booking._id}
              href={`/my-bookings/${booking._id}`}
              className={styles.bookingCard}
            >
              <div>
                <strong>{booking.hallName || "Venue"}</strong>
                <p>{booking.eventType || "Event"}</p>
                <small className={styles.bookingHint}>View order summary</small>
              </div>
              <div>
                <span>Status</span>
                <p className={styles[booking.status] || styles.pending}>
                  {formatLabel(booking.status || "pending")}
                </p>
              </div>
              <div>
                <span>Payment</span>
                <p
                  className={
                    styles[booking.paymentStatus] || styles.pending
                  }
                >
                  {formatLabel(booking.paymentStatus || "pending")}
                </p>
                <small className={styles.amountMeta}>
                  {formatCurrency(booking.amount)}
                </small>
              </div>
              <div>
                <span>Dates</span>
                <p>
                  {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                </p>
              </div>
            </Link>
          ))}
      </section>
    </div>
  );
}
