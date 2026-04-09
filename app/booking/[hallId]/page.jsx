"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./booking.module.css";
import { useAppDialog } from "../../components/GlobalAlertHost";
import {
  buildBookingDateTime,
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatBookingTime,
  formatBookingWindow,
  formatDateInputValue,
  rangesOverlap,
} from "../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";
const BOOKING_DRAFT_STORAGE_KEY = "utsavas-booking-draft";
const FULL_DAY_START_TIME = "00:00";
const FULL_DAY_END_TIME = "23:59";
const EVENT_TYPE_GROUPS = [
  {
    label: "Personal Events",
    options: [
      "Wedding",
      "Reception",
      "Engagement",
      "Birthday Party",
      "Anniversary",
      "Baby Shower",
      "Naming Ceremony",
      "Farewell Party",
      "Get Together",
    ],
  },
  {
    label: "Corporate Events",
    options: [
      "Corporate Meeting",
      "Conference",
      "Seminar",
      "Workshop",
      "Product Launch",
      "Business Meetup",
      "Team Outing",
      "Award Ceremony",
    ],
  },
  {
    label: "Cultural & Social Events",
    options: [
      "Festival Celebration",
      "Cultural Program",
      "Music Concert",
      "Dance Show",
      "Drama / Stage Show",
      "Exhibition",
      "Fashion Show",
    ],
  },
  {
    label: "Religious Events",
    options: [
      "Pooja / Homam",
      "Satyanarayana Pooja",
      "Seemantham",
      "Upanayanam",
      "Temple Festival",
      "Spiritual Gathering",
    ],
  },
  {
    label: "Other Events",
    options: [
      "Dinner Party",
      "Cocktail Party",
      "Networking Event",
      "Charity Event",
      "Sports Event",
      "School / College Event",
    ],
  },
];

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

const parseDateInputValue = (value) => {
  const normalizedDate = formatDateInputValue(value);

  if (!normalizedDate) {
    return null;
  }

  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;

  return {
    value,
    label: formatBookingTime(value, value),
  };
});

const buildExistingRangeDateTime = (booking) => {
  const isOfflineBooking = booking?.status === "offline";
  const start = buildBookingDateTime(
    booking?.checkIn || booking?.startDate,
    isOfflineBooking ? FULL_DAY_START_TIME : booking?.checkInTime,
    {
      fallbackTime: isOfflineBooking
        ? FULL_DAY_START_TIME
        : DEFAULT_CHECK_IN_TIME,
    }
  );
  const end = buildBookingDateTime(
    booking?.checkOut || booking?.endDate,
    isOfflineBooking ? FULL_DAY_END_TIME : booking?.checkOutTime,
    {
      fallbackTime: isOfflineBooking ? FULL_DAY_END_TIME : DEFAULT_CHECK_OUT_TIME,
      endOfDay: isOfflineBooking,
    }
  );

  if (!start || !end) {
    return null;
  }

  return { start, end };
};

const findOverlappingRange = (startDateTime, endDateTime, ranges) =>
  ranges.find((range) => {
    const existingRange = buildExistingRangeDateTime(range);

    return (
      existingRange &&
      rangesOverlap(
        startDateTime,
        endDateTime,
        existingRange.start,
        existingRange.end
      )
    );
  });

export default function BookingPage() {
  const { hallId } = useParams();
  const router = useRouter();
  const { confirm } = useAppDialog();

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
      const inDate = formatDateInputValue(checkInDate);
      setForm((prev) =>
        prev.checkIn === inDate ? prev : { ...prev, checkIn: inDate }
      );
    }

    if (checkOutDate) {
      const outDate = formatDateInputValue(checkOutDate);
      setForm((prev) =>
        prev.checkOut === outDate ? prev : { ...prev, checkOut: outDate }
      );
    }
  }, [checkInDate, checkOutDate]);

  const availableCheckOutOptions = useMemo(() => {
    if (form.checkIn && form.checkOut && form.checkIn === form.checkOut) {
      return TIME_OPTIONS.filter(({ value }) => value > form.checkInTime);
    }

    return TIME_OPTIONS;
  }, [form.checkIn, form.checkOut, form.checkInTime]);

  useEffect(() => {
    if (!form.checkIn || !form.checkOut || form.checkIn !== form.checkOut) {
      return;
    }

    if (availableCheckOutOptions.some((option) => option.value === form.checkOutTime)) {
      return;
    }

    const nextCheckOutTime =
      availableCheckOutOptions[0]?.value || DEFAULT_CHECK_OUT_TIME;

    if (nextCheckOutTime === form.checkOutTime) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      checkOutTime: nextCheckOutTime,
    }));
  }, [
    availableCheckOutOptions,
    form.checkIn,
    form.checkOut,
    form.checkOutTime,
  ]);

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

  const getTileClassName = ({ date }) => {
    const dateKey = formatDateInputValue(date);

    if (isDateOffline(dateKey)) return styles.booked;
    if (isDateApproved(dateKey)) return styles.booked;
    if (isDatePending(dateKey)) return styles.pending;
    return styles.available;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextForm = {
      ...form,
      [name]: value,
    };

    if (name === "checkIn" && nextForm.checkOut && nextForm.checkOut < value) {
      nextForm.checkOut = value;
    }

    setForm(nextForm);

    if (name === "checkIn" || name === "checkOut") {
      setDateRange([
        nextForm.checkIn ? parseDateInputValue(nextForm.checkIn) : null,
        nextForm.checkOut ? parseDateInputValue(nextForm.checkOut) : null,
      ]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rangeStart = parseDateInputValue(form.checkIn);
    const rangeEnd = parseDateInputValue(form.checkOut);
    const checkInDateTime = buildBookingDateTime(form.checkIn, form.checkInTime, {
      fallbackTime: DEFAULT_CHECK_IN_TIME,
    });
    const checkOutDateTime = buildBookingDateTime(form.checkOut, form.checkOutTime, {
      fallbackTime: DEFAULT_CHECK_OUT_TIME,
    });

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

    const overlappingApprovedRange = findOverlappingRange(
      checkInDateTime,
      checkOutDateTime,
      approvedRanges
    );
    const overlappingOfflineRange = findOverlappingRange(
      checkInDateTime,
      checkOutDateTime,
      offlineRanges
    );

    if (overlappingApprovedRange || overlappingOfflineRange) {
      alert(
        "This date and time slot is already booked. Please choose a different schedule."
      );
      return;
    }

    if (findOverlappingRange(checkInDateTime, checkOutDateTime, pendingRanges)) {
      const proceed = await confirm({
        title: "Pending Booking Request",
        message: "This schedule already has a pending request. Continue anyway?",
        confirmLabel: "Continue",
      });
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
              Select your dates first, then choose the exact time slot. Colored
              dates already have booking activity, but same-day morning and
              evening events can still work if the times do not overlap.
            </p>
          </div>
        </div>

        <div className={styles.calendarLegend} aria-label="Calendar status legend">
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.legendAvailable}`}
              aria-hidden="true"
            ></span>
            Open day
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
            Confirmed booking
          </span>
        </div>

        <p className={styles.calendarNote}>
          Final blocking happens using both date and time, not only the calendar
          day.
        </p>

        <Calendar
          selectRange={true}
          onChange={setDateRange}
          value={dateRange}
          minDate={new Date()}
          tileClassName={getTileClassName}
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
              min={formatDateInputValue(new Date())}
              onChange={handleChange}
            />
          </label>

          <label>
            Check-in Time
            <select
              name="checkInTime"
              value={form.checkInTime}
              required
              onChange={handleChange}
            >
              {TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <select
              name="checkOutTime"
              value={
                availableCheckOutOptions.some(
                  (option) => option.value === form.checkOutTime
                )
                  ? form.checkOutTime
                  : ""
              }
              required
              onChange={handleChange}
            >
              {availableCheckOutOptions.length === 0 ? (
                <option value="">Choose the next day for check-out</option>
              ) : null}
              {availableCheckOutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className={styles.timeHelper}>
          Time options use AM/PM format, and the booking will be blocked only if
          another event overlaps the same date and time range.
        </p>

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
            {EVENT_TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((eventName) => (
                  <option key={eventName} value={eventName}>
                    {eventName}
                  </option>
                ))}
              </optgroup>
            ))}
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
