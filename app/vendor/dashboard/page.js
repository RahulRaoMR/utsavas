"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../vendorDashboard.module.css";

export default function VendorDashboard() {
  const router = useRouter();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // bookings + calendar
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* =========================
     AUTH + FETCH BOOKINGS
  ========================= */
  useEffect(() => {
    const storedVendor = localStorage.getItem("vendor");

    if (!storedVendor) {
      router.replace("/vendor/vendor-login");
      return;
    }

    const parsedVendor = JSON.parse(storedVendor);
    setVendor(parsedVendor);
    setLoading(false);

    fetch(`http://localhost:5000/api/bookings/vendor/${parsedVendor._id}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings", err));
  }, [router]);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("vendor");
    router.replace("/vendor/vendor-login");
  };

  /* =========================
     CALENDAR HELPERS
  ========================= */
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const isDateBooked = (date) => {
    return bookings.find((b) => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      return date >= start && date <= end;
    });
  };

  /* =========================
     REVENUE CALCULATIONS
  ========================= */
  const monthlyBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkIn);
    return (
      checkIn.getMonth() === currentMonth.getMonth() &&
      checkIn.getFullYear() === currentMonth.getFullYear()
    );
  });

  const approvedBookings = monthlyBookings.filter(
    (b) => b.status === "approved"
  );

  const pendingBookings = monthlyBookings.filter(
    (b) => b.status === "pending"
  );

  // TEMP revenue logic (₹50,000 per approved booking)
  const estimatedRevenue = approvedBookings.length * 50000;

  if (loading) {
    return <p className={styles.loading}>Loading dashboard...</p>;
  }

  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div className={styles.logo}>UTSAVAM</div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* ================= WELCOME ================= */}
      <div className={styles.welcomeBox}>
        <h1>Welcome, {vendor?.businessName} 👋</h1>
        <p>
          Manage your halls, booking requests, and grow your business with{" "}
          <b>UTSAVAM</b>.
        </p>

        <p className={styles.muted}>
          <b>Owner:</b> {vendor?.ownerName} &nbsp;|&nbsp;
          <b>Email:</b> {vendor?.email} &nbsp;|&nbsp;
          <b>City:</b> {vendor?.city}
        </p>
      </div>

      {/* ================= ACTION CARDS ================= */}
      <div className={styles.actions}>
        <div className={styles.card} onClick={() => router.push("/vendor/add-hall")}>
          <div className={styles.cardIcon}>➕</div>
          <div className={styles.cardTitle}>Add New Hall</div>
          <div className={styles.muted}>Create a new venue listing</div>
        </div>

        <div className={styles.card} onClick={() => router.push("/vendor/my-halls")}>
          <div className={styles.cardIcon}>🏛️</div>
          <div className={styles.cardTitle}>My Halls</div>
          <div className={styles.muted}>View & manage your halls</div>
        </div>

        <div className={styles.card} onClick={() => router.push("/vendor/bookings")}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardTitle}>Booking Requests</div>
          <div className={styles.muted}>Manage customer bookings</div>
        </div>
      </div>

      {/* ================= BOOKING CALENDAR ================= */}
      <div className={styles.calendarSection}>
        <h2 className={styles.calendarTitle}>📅 Booking Calendar</h2>

        <div className={styles.monthBar}>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            ◀
          </button>

          <span>
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            ▶
          </button>
        </div>

        <div className={styles.calendarGrid}>
          {Array.from({ length: getDaysInMonth() }).map((_, i) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              i + 1
            );

            const booking = isDateBooked(date);

            return (
              <div
                key={i}
                className={`${styles.day} ${
                  booking
                    ? booking.status === "approved"
                      ? styles.approved
                      : styles.pending
                    : ""
                }`}
                onClick={() => {
                  if (booking) {
                    setSelectedBooking(booking);
                    setShowModal(true);
                  }
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div className={styles.legend}>
          <span className={styles.pending}>Pending</span>
          <span className={styles.approved}>Approved</span>
        </div>
      </div>

      {/* ================= REVENUE SUMMARY ================= */}
      <div className={styles.revenueSection}>
        <h2 className={styles.revenueTitle}>💰 Monthly Revenue Summary</h2>

        <div className={styles.revenueGrid}>
          <div className={styles.revenueCard}>
            <p>Total Bookings</p>
            <h3>{monthlyBookings.length}</h3>
          </div>

          <div className={styles.revenueCard}>
            <p>Approved</p>
            <h3>{approvedBookings.length}</h3>
          </div>

          <div className={styles.revenueCard}>
            <p>Pending</p>
            <h3>{pendingBookings.length}</h3>
          </div>

          <div className={`${styles.revenueCard} ${styles.revenueHighlight}`}>
            <p>Estimated Revenue</p>
            <h3>₹ {estimatedRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* ================= BOOKING DETAILS MODAL ================= */}
      {showModal && selectedBooking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Booking Details</h2>

            <p><span>Hall:</span> {selectedBooking.hall?.hallName}</p>
            <p>
              <span>Dates:</span>{" "}
              {new Date(selectedBooking.checkIn).toDateString()} →{" "}
              {new Date(selectedBooking.checkOut).toDateString()}
            </p>
            <p><span>Customer:</span> {selectedBooking.customerName}</p>
            <p><span>Phone:</span> {selectedBooking.phone}</p>
            <p><span>Event:</span> {selectedBooking.eventType}</p>
            <p><span>Guests:</span> {selectedBooking.guests || "N/A"}</p>
            <p>
              <span>Status:</span>{" "}
              <b>{selectedBooking.status.toUpperCase()}</b>
            </p>

            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
