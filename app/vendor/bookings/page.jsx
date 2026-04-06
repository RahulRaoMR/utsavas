"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../vendorDashboard.module.css";
import {
  clearVendorSession,
  getVendorAuthHeaders,
  getVendorSession,
} from "../../../lib/panelAuth";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingWindow,
} from "../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function VendorBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/vendor/dashboard");
  };

  const fetchBookings = useCallback(async () => {
    try {
      const session = getVendorSession();

      if (!session.vendor || !session.vendorId || !session.token) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const res = await fetch(`${API}/api/bookings/vendor/${session.vendorId}`, {
        cache: "no-store",
        headers: getVendorAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch bookings");
      }

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch bookings error", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId, status) => {
    try {
      const session = getVendorSession();

      if (!session.token) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const res = await fetch(`${API}/api/bookings/status/${bookingId}`, {
        method: "PATCH",
        headers: getVendorAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status }),
      });

      if (res.status === 401 || res.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to update status");
        return;
      }

      if (data?.message) {
        alert(data.message);
      }

      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Booking Requests</h1>
        <button className={styles.backButton} onClick={handleBack} type="button">
          Back
        </button>
      </div>

      {loading ? <p style={{ marginTop: 20 }}>Loading...</p> : null}

      {!loading && bookings.length === 0 ? (
        <p style={{ marginTop: 20 }}>No booking requests yet.</p>
      ) : null}

      <div className={styles.cardGrid}>
        {bookings.map((booking) => (
          <div key={booking._id} className={styles.card}>
            <div className={styles.cardLeft}>
              <h3 className={styles.hallName}>
                {booking.hall?.hallName || booking.hallName || "Hall"}
              </h3>

              <p>
                <span>Schedule:</span>{" "}
                {booking.status === "offline"
                  ? `${formatBookingDate(booking.checkIn)} to ${formatBookingDate(
                      booking.checkOut
                    )} (blocked all day)`
                  : formatBookingWindow(booking)}
              </p>

              {booking.status === "offline" ? null : (
                <>
                  <p>
                    <span>Check-in:</span>{" "}
                    {formatBookingDateTime(
                      booking.checkIn,
                      booking.checkInTime,
                      "-",
                      DEFAULT_CHECK_IN_TIME
                    )}
                  </p>

                  <p>
                    <span>Check-out:</span>{" "}
                    {formatBookingDateTime(
                      booking.checkOut,
                      booking.checkOutTime,
                      "-",
                      DEFAULT_CHECK_OUT_TIME
                    )}
                  </p>
                </>
              )}

              <p>
                <span>Event:</span> {booking.eventType || "-"}
              </p>

              <p>
                <span>Guests:</span> {booking.guests || "N/A"}
              </p>

              <p>
                <span>Customer:</span> {booking.customerName || "-"}
              </p>

              <p>
                <span>Phone:</span> {booking.phone || "-"}
              </p>

              <p>
                <span>Status:</span>{" "}
                <strong className={styles.status}>
                  {String(booking.status || "").toUpperCase()}
                </strong>
              </p>
            </div>

            {booking.status === "pending" ? (
              <div className={styles.cardActions}>
                <button
                  className={styles.approveBtn}
                  onClick={() => updateStatus(booking._id, "approved")}
                  type="button"
                >
                  Approve
                </button>

                <button
                  className={styles.rejectBtn}
                  onClick={() => updateStatus(booking._id, "rejected")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
