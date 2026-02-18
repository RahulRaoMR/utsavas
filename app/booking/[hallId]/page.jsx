"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./booking.module.css";

export default function BookingPage() {
  const { hallId } = useParams();
  const router = useRouter();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ⭐ AIRBNB RANGE STATE */
  const [dateRange, setDateRange] = useState([null, null]);
  const [checkInDate, checkOutDate] = dateRange;

  /* 🔥 separate by status */
  const [approvedRanges, setApprovedRanges] = useState([]);
  const [pendingRanges, setPendingRanges] = useState([]);

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    eventType: "",
    guests: "",
    name: "",
    phone: "",
  });

  /* =========================
     FETCH HALL DETAILS
  ========================= */
  useEffect(() => {
    const fetchHall = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/halls/${hallId}`
        );
        if (!res.ok) throw new Error("Failed to fetch hall");
        const data = await res.json();
        setHall(data);
      } catch (error) {
        console.error("Error fetching hall:", error);
      }
    };

    if (hallId) fetchHall();
  }, [hallId]);

  /* =========================
     FETCH BOOKED DATES
  ========================= */
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/hall/${hallId}`
        );
        const data = await res.json();

        const approved = [];
        const pending = [];

        data.forEach((b) => {
          if (b.status === "approved") approved.push(b);
          if (b.status === "pending") pending.push(b);
        });

        setApprovedRanges(approved);
        setPendingRanges(pending);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    if (hallId) fetchBookedDates();
  }, [hallId]);

  /* ===================================
     🔄 CALENDAR → INPUT SYNC
  =================================== */
  useEffect(() => {
    if (checkInDate) {
      const inDate = checkInDate.toISOString().split("T")[0];
      setForm((prev) => ({ ...prev, checkIn: inDate }));
    }

    if (checkOutDate) {
      const outDate = checkOutDate.toISOString().split("T")[0];
      setForm((prev) => ({ ...prev, checkOut: outDate }));
    }
  }, [checkInDate, checkOutDate]);

  /* =========================
     HELPERS
  ========================= */

  const isDateApproved = (date) => {
    return approvedRanges.some((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const selected = new Date(date);
      return selected >= checkIn && selected <= checkOut;
    });
  };

  const isDatePending = (date) => {
    return pendingRanges.some((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const selected = new Date(date);
      return selected >= checkIn && selected <= checkOut;
    });
  };

  /* 🎨 calendar coloring */
  const getTileClassName = ({ date }) => {
    const d = date.toISOString().split("T")[0];

    if (isDateApproved(d)) return styles.booked;
    if (isDatePending(d)) return styles.pending;
    return styles.available;
  };

  /* =========================
     INPUT → CALENDAR SYNC
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "checkIn") {
      setDateRange([
        value ? new Date(value) : null,
        checkOutDate,
      ]);
    }

    if (name === "checkOut") {
      setDateRange([
        checkInDate,
        value ? new Date(value) : null,
      ]);
    }
  };

  /* =========================
     SUBMIT BOOKING
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDateApproved(form.checkIn) || isDateApproved(form.checkOut)) {
      alert("❌ These dates are already fully booked.");
      return;
    }

    if (isDatePending(form.checkIn) || isDatePending(form.checkOut)) {
      const proceed = confirm(
        "⚠️ These dates have pending requests. Continue?"
      );
      if (!proceed) return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hallId: hallId,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            eventType: form.eventType,
            guests: Number(form.guests),
            customerName: form.name,
            phone: form.phone,
          }),
        }
      );

      if (res.ok) {
        router.push(`/booking/${hallId}/payment`);
      } else {
        const data = await res.json();
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!hall) {
    return <p className={styles.loading}>Loading hall details...</p>;
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1>{hall.hallName}</h1>
      </div>

      {/* ⭐ AIRBNB RANGE CALENDAR */}
      <div className={styles.calendarBox}>
        <h3>Availability Calendar</h3>

        <Calendar
          selectRange={true}
          onChange={setDateRange}
          value={dateRange}
          tileClassName={getTileClassName}
          tileDisabled={({ date }) => {
            const d = date.toISOString().split("T")[0];
            return isDateApproved(d);
          }}
        />

        {/* ⭐ nights counter */}
        {checkInDate && checkOutDate && (
          <p
            style={{
              marginTop: 10,
              fontWeight: 600,
              color: "#6b1d2b",
            }}
          >
            {Math.ceil(
              (checkOutDate - checkInDate) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            nights selected
          </p>
        )}
      </div>

      {/* BOOKING FORM */}
      <form
        className={`${styles.card} ${styles.form}`}
        onSubmit={handleSubmit}
      >
        <h2>Select Your Dates</h2>

        <label>
          Check-in Date
          <input
            type="date"
            name="checkIn"
            value={form.checkIn}
            required
            min={new Date().toISOString().split("T")[0]}
            onChange={handleChange}
          />
        </label>

        <label>
          Check-out Date
          <input
            type="date"
            name="checkOut"
            value={form.checkOut}
            required
            min={form.checkIn}
            onChange={handleChange}
          />
        </label>

        <label>
          Event Type
          <select
            name="eventType"
            value={form.eventType}
            required
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>Wedding</option>
            <option>Reception</option>
            <option>Engagement</option>
            <option>Birthday</option>
            <option>Corporate</option>
          </select>
        </label>

        <label>
          Number of Guests
          <input
            type="number"
            name="guests"
            placeholder="e.g. 300"
            value={form.guests}
            onChange={handleChange}
          />
        </label>

        <label>
          Your Name
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            required
            onChange={handleChange}
          />
        </label>

        <label>
          Phone Number
          <input
            type="tel"
            name="phone"
            placeholder="10-digit number"
            value={form.phone}
            required
            onChange={handleChange}
          />
        </label>

        <button className={styles.button} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}
