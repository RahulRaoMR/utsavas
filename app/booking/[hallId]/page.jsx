"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./booking.module.css";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingWindow,
  normalizeBookingTime,
} from "../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";
const BOOKING_DRAFT_STORAGE_KEY = "utsavas-booking-draft";

const toDayStart = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const toDayEnd = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date;
};

const rangesOverlap = (startA, endA, startB, endB) =>
  startA <= endB && endA >= startB;

const buildDateTime = (dateValue, timeValue) => {
  const normalizedTime = normalizeBookingTime(timeValue);

  if (!dateValue || !normalizedTime) {
    return null;
  }

  const [year, month, day] = String(dateValue).split("-").map(Number);
  const [hours, minutes] = normalizedTime.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export default function BookingPage() {
  const { hallId } = useParams();
  const router = useRouter();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [checkInDate, checkOutDate] = dateRange;
  const [approvedRanges, setApprovedRanges] = useState([]);
  const [pendingRanges, setPendingRanges] = useState([]);
  const [offlineRanges, setOfflineRanges] = useState([]);

  const [form, setForm] = useState({
    checkIn: "",
    checkInTime: DEFAULT_CHECK_IN_TIME,
    checkOut: "",
    checkOutTime: DEFAULT_CHECK_OUT_TIME,
    eventType: "",
    guests: "",
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (!hallId) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token || !user) {
      if (token && !user) {
        localStorage.removeItem("token");
      }
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(`/booking/${hallId}`)}`);
      return;
    }

    setIsAuthorized(true);
  }, [hallId, router]);

  useEffect(() => {
    if (!hallId || isAuthorized !== true) return;

    const fetchHall = async () => {
      try {
        const res = await fetch(`${API}/api/halls/${hallId}`);
        if (!res.ok) throw new Error("Failed to fetch hall");
        const data = await res.json();
        setHall(data);
      } catch (error) {
        console.error("Error fetching hall:", error);
      }
    };

    fetchHall();
  }, [hallId, isAuthorized]);

  useEffect(() => {
    if (!hallId || isAuthorized !== true) return;

    const fetchBookedDates = async () => {
      try {
        const res = await fetch(`${API}/api/bookings/hall/${hallId}`);
        const data = await res.json();

        const approved = [];
        const pending = [];
        const offline = [];

        data.forEach((booking) => {
          if (booking.status === "approved") approved.push(booking);
          if (booking.status === "pending") pending.push(booking);
          if (booking.status === "offline") offline.push(booking);
        });

        setApprovedRanges(approved);
        setPendingRanges(pending);
        setOfflineRanges(offline);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
  }, [hallId, isAuthorized]);

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

  const isDateWithinRanges = (date, ranges) => {
    const selected = toDayStart(date);

    return ranges.some((range) => {
      const checkIn = toDayStart(range.checkIn);
      const checkOut = toDayEnd(range.checkOut);

      return selected && checkIn && checkOut && selected >= checkIn && selected <= checkOut;
    });
  };

  const isDateApproved = (date) => isDateWithinRanges(date, approvedRanges);
  const isDatePending = (date) => isDateWithinRanges(date, pendingRanges);
  const isDateOffline = (date) => isDateWithinRanges(date, offlineRanges);

  const rangeOverlapsAny = (startDate, endDate, ranges) => {
    return ranges.some((range) => {
      const rangeStart = toDayStart(range.checkIn);
      const rangeEnd = toDayEnd(range.checkOut);

      return (
        rangeStart &&
        rangeEnd &&
        rangesOverlap(startDate, endDate, rangeStart, rangeEnd)
      );
    });
  };

  const getTileClassName = ({ date }) => {
    const dateKey = date.toISOString().split("T")[0];

    if (isDateOffline(dateKey)) return styles.booked;
    if (isDateApproved(dateKey)) return styles.booked;
    if (isDatePending(dateKey)) return styles.pending;
    return styles.available;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "checkIn") {
      setDateRange([value ? new Date(value) : null, checkOutDate]);
    }

    if (name === "checkOut") {
      setDateRange([checkInDate, value ? new Date(value) : null]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rangeStart = toDayStart(form.checkIn);
    const rangeEnd = toDayEnd(form.checkOut);
    const checkInDateTime = buildDateTime(form.checkIn, form.checkInTime);
    const checkOutDateTime = buildDateTime(form.checkOut, form.checkOutTime);

    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      alert("Please choose a valid date range.");
      return;
    }

    if (!checkInDateTime || !checkOutDateTime) {
      alert("Please choose exact check-in and check-out times.");
      return;
    }

    if (checkOutDateTime <= checkInDateTime) {
      alert("Check-out time must be later than check-in time.");
      return;
    }

    if (
      rangeOverlapsAny(rangeStart, rangeEnd, approvedRanges) ||
      rangeOverlapsAny(rangeStart, rangeEnd, offlineRanges)
    ) {
      alert("These dates are already fully booked.");
      return;
    }

    if (rangeOverlapsAny(rangeStart, rangeEnd, pendingRanges)) {
      const proceed = confirm(
        "These dates already have pending requests. Continue?"
      );
      if (!proceed) return;
    }

    try {
      setLoading(true);

      if (typeof window !== "undefined") {
        const bookingDraft = {
          hallId,
          hall: {
            _id: hall?._id,
            hallName: hall?.hallName,
            category: hall?.category,
            capacity: hall?.capacity,
            pricePerEvent: hall?.pricePerEvent,
            pricePerDay: hall?.pricePerDay,
            pricePerPlate: hall?.pricePerPlate,
            images: hall?.images || [],
            address: hall?.address || {},
          },
          booking: {
            checkIn: form.checkIn,
            checkInTime: form.checkInTime,
            checkOut: form.checkOut,
            checkOutTime: form.checkOutTime,
            eventType: form.eventType,
            guests: Number(form.guests) || 0,
            customerName: form.name,
            phone: form.phone,
          },
          savedAt: Date.now(),
        };

        sessionStorage.setItem(
          `${BOOKING_DRAFT_STORAGE_KEY}:${hallId}`,
          JSON.stringify(bookingDraft)
        );
      }

      router.push(`/booking/${hallId}/summary`);
    } catch {
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized !== true) {
    return <p className={styles.loading}>Checking login...</p>;
  }

  if (!hall) {
    return <p className={styles.loading}>Loading hall details...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{hall.hallName}</h1>
      </div>

      <div className={styles.calendarBox}>
        <div className={styles.calendarHeader}>
          <span className={styles.calendarBadge} aria-hidden="true">
            <span className={styles.calendarRingLeft}></span>
            <span className={styles.calendarRingRight}></span>
            <span className={styles.calendarStar}>*</span>
          </span>
          <div>
            <h3>Availability Calendar</h3>
            <p className={styles.calendarSubtext}>
              Select your event dates from the live venue calendar. Red dates are
              unavailable, and gold dates have pending requests.
            </p>
          </div>
        </div>

        <div className={styles.calendarLegend} aria-label="Calendar status legend">
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.legendAvailable}`}
              aria-hidden="true"
            ></span>
            Available
          </span>
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.legendPending}`}
              aria-hidden="true"
            ></span>
            Pending
          </span>
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.legendBooked}`}
              aria-hidden="true"
            ></span>
            Booked
          </span>
        </div>

        <Calendar
          selectRange={true}
          onChange={setDateRange}
          value={dateRange}
          tileClassName={getTileClassName}
          tileDisabled={({ date }) => {
            const dateKey = date.toISOString().split("T")[0];
            return isDateApproved(dateKey) || isDateOffline(dateKey);
          }}
        />

        {checkInDate && checkOutDate ? (
          <p className={styles.nightsText}>
            {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} nights
            selected
          </p>
        ) : null}
      </div>

      <form className={`${styles.card} ${styles.form}`} onSubmit={handleSubmit}>
        <h2>Select Your Dates</h2>
        <p className={styles.formNote}>
          Add the exact entry and exit time so both you and the venue partner
          follow the same event schedule.
        </p>

        <div className={styles.fieldGrid}>
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
            Check-in Time
            <input
              type="time"
              name="checkInTime"
              value={form.checkInTime}
              required
              step="900"
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={styles.fieldGrid}>
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
            Check-out Time
            <input
              type="time"
              name="checkOutTime"
              value={form.checkOutTime}
              required
              step="900"
              min={form.checkIn === form.checkOut ? form.checkInTime : undefined}
              onChange={handleChange}
            />
          </label>
        </div>

        {form.checkIn && form.checkOut ? (
          <div className={styles.schedulePreview}>
            <span>Exact schedule</span>
            <strong>{formatBookingWindow(form)}</strong>
          </div>
        ) : null}

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
          {loading ? "Preparing..." : "Review Order Summary"}
        </button>
      </form>
    </div>
  );
}
