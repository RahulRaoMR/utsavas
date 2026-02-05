"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./booking.module.css";

export default function BookingPage() {
  const { hallId } = useParams();
  const router = useRouter();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);

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
        setBookedRanges(data);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    if (hallId) fetchBookedDates();
  }, [hallId]);

  /* =========================
     HELPER: CHECK DATE IS BOOKED
  ========================= */
  const isDateBooked = (date) => {
    return bookedRanges.some((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const selected = new Date(date);

      return selected >= checkIn && selected <= checkOut;
    });
  };

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT BOOKING
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.checkIn || !form.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (isDateBooked(form.checkIn) || isDateBooked(form.checkOut)) {
      alert("Selected dates are already booked. Please choose another date.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hallId,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            eventType: form.eventType,
            guests: form.guests,
            name: form.name,
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
        <p>
          {hall.address
            ? `${hall.address.area}, ${hall.address.city}, ${hall.address.state} - ${hall.address.pincode}`
            : "Address not available"}
        </p>
      </div>

      {/* BOOKING CARD */}
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
