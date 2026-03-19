"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../vendorDashboard.module.css";

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

  /* =========================
     FETCH BOOKINGS (MEMOIZED)
  ========================= */
  const fetchBookings = useCallback(async () => {
    try {
      const vendorData =
        typeof window !== "undefined"
          ? localStorage.getItem("vendor")
          : null;

      if (!vendorData) {
        router.push("/login");
        return;
      }

      const vendor = JSON.parse(vendorData);

      const res = await fetch(
        `https://utsavas-backend-1.onrender.com/api/bookings/vendor/${vendor._id}`
      );

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch bookings error ❌", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* =========================
     RUN ONLY ONCE ✅
  ========================= */
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* =========================
     UPDATE BOOKING STATUS
  ========================= */
  const updateStatus = async (bookingId, status) => {
    try {
      const res = await fetch(
        `https://utsavas-backend-1.onrender.com/api/bookings/status/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      // ✅ refresh list once
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status ❌", error);
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

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <p style={{ marginTop: 20 }}>No booking requests yet.</p>
      )}

      <div className={styles.cardGrid}>
        {bookings.map((booking) => (
          <div key={booking._id} className={styles.card}>
            {/* LEFT */}
            <div className={styles.cardLeft}>
              <h3 className={styles.hallName}>
                {booking.hall?.hallName || "Hall"}
              </h3>

              <p>
                <span>Dates:</span>{" "}
                {new Date(booking.checkIn).toDateString()} →{" "}
                {new Date(booking.checkOut).toDateString()}
              </p>

              <p>
                <span>Event:</span> {booking.eventType}
              </p>

              <p>
                <span>Guests:</span> {booking.guests || "N/A"}
              </p>

              <p>
                <span>Customer:</span> {booking.customerName}
              </p>

              <p>
                <span>Phone:</span> {booking.phone}
              </p>

              <p>
                <span>Status:</span>{" "}
                <strong className={styles.status}>
                  {booking.status?.toUpperCase()}
                </strong>
              </p>
            </div>

            {/* RIGHT */}
            {booking.status === "pending" && (
              <div className={styles.cardActions}>
                <button
                  className={styles.approveBtn}
                  onClick={() =>
                    updateStatus(booking._id, "approved")
                  }
                >
                  Approve
                </button>

                <button
                  className={styles.rejectBtn}
                  onClick={() =>
                    updateStatus(booking._id, "rejected")
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
