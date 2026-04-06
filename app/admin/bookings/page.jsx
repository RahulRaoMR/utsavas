"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import styles from "../admin.module.css";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminToken,
} from "../../../lib/panelAuth";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingDateTime,
  formatBookingWindow,
} from "../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const adminToken = getAdminToken();

        if (!adminToken) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const res = await fetch(`${API}/api/bookings/admin/bookings`, {
          cache: "no-store",
          headers: getAdminAuthHeaders(),
        });

        if (res.status === 401 || res.status === 403) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await res.json();

        const formatted = (Array.isArray(data) ? data : []).map((b) => {
          let bgColor = "#3b82f6";

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
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const intervalId = window.setInterval(fetchBookings, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchBookings();
    };

    window.addEventListener("focus", fetchBookings);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchBookings);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps);
  };

  const getPaymentClass = (status) => {
    if (status === "paid") return styles.paymentPaid;
    if (status === "failed") return styles.paymentFailed;
    return styles.paymentPending;
  };

  return (
    <div className={styles.container}>
      <div className={styles.topHeader}>
        <h1 className={styles.header}>Admin Calendar</h1>
      </div>

      <div className={styles.pageToolbar}>
        <p className={styles.liveMeta}>
          {loading ? "Loading live calendar..." : `Live bookings: ${events.length}`}
        </p>

        <div className={styles.calendarLegend}>
          <span className={styles.legendItem}>
            <i className={`${styles.legendDot} ${styles.legendApproved}`}></i>
            Approved
          </span>
          <span className={styles.legendItem}>
            <i className={`${styles.legendDot} ${styles.legendPending}`}></i>
            Pending
          </span>
          <span className={styles.legendItem}>
            <i className={`${styles.legendDot} ${styles.legendRejected}`}></i>
            Rejected
          </span>
        </div>
      </div>

      <div className={styles.card} style={{ padding: 20, minHeight: 700 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
          eventDisplay="block"
        />
      </div>

      {selectedBooking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Booking Details</h3>

            <div className={styles.modalGrid}>
              <p><b>Customer:</b> {selectedBooking.customerName}</p>
              <p><b>Vendor:</b> {selectedBooking.vendorName}</p>
              <p><b>Hall:</b> {selectedBooking.hallName}</p>

              <p>
                <b>Check-in:</b>{" "}
                {formatBookingDateTime(
                  selectedBooking.checkIn,
                  selectedBooking.checkInTime,
                  "-",
                  DEFAULT_CHECK_IN_TIME
                )}
              </p>
              <p>
                <b>Check-out:</b>{" "}
                {formatBookingDateTime(
                  selectedBooking.checkOut,
                  selectedBooking.checkOutTime,
                  "-",
                  DEFAULT_CHECK_OUT_TIME
                )}
              </p>
              <p>
                <b>Schedule:</b> {formatBookingWindow(selectedBooking)}
              </p>

              <p><b>Amount:</b> Rs {selectedBooking.amount}</p>

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
