"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styles from "../admin.module.css";

export default function AdminBookingsPage() {
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  /* =========================
     FETCH BOOKINGS
  ========================= */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/bookings/admin/bookings"
        );
        const data = await res.json();

        // ⭐ PREMIUM EVENT MAPPING WITH COLORS
        const formatted = data.map((b) => {
          let bgColor = "#3b82f6"; // default blue

          if (b.status === "approved") bgColor = "#16a34a";
          else if (b.status === "pending") bgColor = "#f59e0b";
          else if (b.status === "rejected") bgColor = "#dc2626";

          return {
            title: b.hallName || "Booking",
            start: new Date(b.checkIn).toISOString().split("T")[0],
            end: new Date(b.checkOut).toISOString().split("T")[0],
            backgroundColor: bgColor,
            borderColor: bgColor,
            extendedProps: b,
          };
        });

        setEvents(formatted);
      } catch (err) {
        console.error("Failed to load bookings", err);
      }
    };

    fetchBookings();
  }, []);

  /* =========================
     EVENT CLICK
  ========================= */
  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps);
  };

  /* =========================
     PAYMENT BADGE CLASS
  ========================= */
  const getPaymentClass = (status) => {
    if (status === "paid") return styles.paymentPaid;
    if (status === "failed") return styles.paymentFailed;
    return styles.paymentPending;
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.topHeader}>
        <h1 className={styles.header}>Admin Bookings</h1>
      </div>

      {/* CALENDAR */}
      <div
        className={styles.card}
        style={{ padding: 20, minHeight: 700 }}
      >
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
          eventDisplay="block"
        />
      </div>

      {/* PREMIUM MODAL */}
      {selectedBooking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Booking Details
            </h3>

            <div className={styles.modalGrid}>
              <p><b>Customer:</b> {selectedBooking.customerName}</p>
              <p><b>Vendor:</b> {selectedBooking.vendorName}</p>
              <p><b>Hall:</b> {selectedBooking.hallName}</p>

              <p>
                <b>From:</b>{" "}
                {new Date(selectedBooking.checkIn).toLocaleDateString()}
              </p>
              <p>
                <b>To:</b>{" "}
                {new Date(selectedBooking.checkOut).toLocaleDateString()}
              </p>

              <p><b>Amount:</b> ₹{selectedBooking.amount}</p>

              <p>
                <b>Payment:</b>{" "}
                {selectedBooking.paymentMethod === "online"
                  ? "Online Paid"
                  : "Pay at Venue"}
              </p>

              <p>
                <b>Payment Status:</b>{" "}
                <span className={getPaymentClass(selectedBooking.paymentStatus)}>
                  {selectedBooking.paymentStatus}
                </span>
              </p>

              <p>
                <b>Booking Status:</b>{" "}
                <span className={styles.statusBadge}>
                  {selectedBooking.status}
                </span>
              </p>
            </div>

            <button
              className={styles.closeBtn}
              onClick={() => setSelectedBooking(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}