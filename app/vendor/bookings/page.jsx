"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../vendorDashboard.module.css";

export default function VendorBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);

  /* =========================
     FETCH BOOKINGS
  ========================= */
  const fetchBookings = async () => {
    try {
      const vendor = JSON.parse(localStorage.getItem("vendor"));

      if (!vendor) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/bookings/vendor/${vendor._id}`
      );

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Fetch bookings error ❌", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [router]);

  /* =========================
     UPDATE BOOKING STATUS
  ========================= */
  const updateStatus = async (bookingId, status) => {
    try {
      console.log("Updating:", bookingId, status);

      const res = await fetch(
        `http://localhost:5000/api/bookings/status/${bookingId}`,
        {
          method: "PATCH", // ⭐ IMPORTANT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      console.log("Status update response:", data);

      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      // ✅ BEST PRACTICE — refetch from server
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status ❌", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Booking Requests</h1>

      {bookings.length === 0 && (
        <p style={{ marginTop: 20 }}>No booking requests yet.</p>
      )}

      <div className={styles.cardGrid}>
        {bookings.map((booking) => (
          <div key={booking._id} className={styles.card}>
            {/* LEFT CONTENT */}
            <div className={styles.cardLeft}>
              <h3 className={styles.hallName}>
                {booking.hall?.hallName}
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

            {/* RIGHT ACTIONS */}
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
