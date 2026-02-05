"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./vendorCalendar.module.css";

export default function VendorCalendarPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const vendor = JSON.parse(localStorage.getItem("vendor"));

    if (!vendor) {
      router.push("/login");
      return;
    }

    fetch(`http://localhost:5000/api/bookings/vendor/${vendor._id}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));
  }, [router]);

  /* =========================
     DATE HELPERS
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
     RENDER DAYS
  ========================= */
  const days = [];
  const totalDays = getDaysInMonth();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const booking = isDateBooked(date);

    days.push(
      <div
        key={day}
        className={`${styles.day} ${
          booking
            ? booking.status === "approved"
              ? styles.approved
              : booking.status === "pending"
              ? styles.pending
              : styles.rejected
            : ""
        }`}
      >
        <span>{day}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Booking Calendar</h1>

      {/* MONTH NAVIGATION */}
      <div className={styles.monthBar}>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(year, month - 1, 1)
            )
          }
        >
          ◀
        </button>

        <h2>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(year, month + 1, 1)
            )
          }
        >
          ▶
        </button>
      </div>

      {/* CALENDAR GRID */}
      <div className={styles.grid}>{days}</div>

      {/* LEGEND */}
      <div className={styles.legend}>
        <span className={styles.legendPending}>Pending</span>
        <span className={styles.legendApproved}>Approved</span>
        <span className={styles.legendRejected}>Rejected</span>
      </div>
    </div>
  );
}