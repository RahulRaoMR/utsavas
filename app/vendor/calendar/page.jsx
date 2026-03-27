"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./vendorCalendar.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const getVendorSession = () => {
  if (typeof window === "undefined") {
    return {
      token: "",
      vendorId: "",
    };
  }

  const rawVendor = localStorage.getItem("vendor");
  const vendor = rawVendor ? JSON.parse(rawVendor) : null;

  return {
    token: localStorage.getItem("vendorToken") || "",
    vendorId: vendor?._id || vendor?.id || "",
  };
};

const getVendorHeaders = (token) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

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

const STATUS_PRIORITY = {
  offline: 3,
  approved: 2,
  pending: 1,
  rejected: 0,
};

const getHallIdFromItem = (item) =>
  String(item?.hall?._id || item?.hallId || item?.hall || "");

export default function VendorCalendarPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const loadCalendar = async () => {
      const session = getVendorSession();

      if (!session.vendorId || !session.token) {
        router.push("/vendor/vendor-login");
        return;
      }

      const headers = getVendorHeaders(session.token);

      try {
        const [bookingsRes, hallsRes] = await Promise.all([
          fetch(`${API}/api/bookings/vendor/${session.vendorId}`, {
            cache: "no-store",
            headers,
          }),
          fetch(`${API}/api/halls/vendor/${session.vendorId}`, {
            cache: "no-store",
            headers,
          }),
        ]);

        const bookingsData = await bookingsRes.json().catch(() => []);
        const hallsData = await hallsRes.json().catch(() => ({}));
        const resolvedHalls = Array.isArray(hallsData?.data) ? hallsData.data : [];

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setHalls(resolvedHalls);
        setSelectedHallId((currentValue) => currentValue || resolvedHalls[0]?._id || "");
      } catch (error) {
        console.error(error);
      }
    };

    loadCalendar();
  }, [router]);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const filteredBookings = bookings
    .filter((booking) => String(getHallIdFromItem(booking)) === String(selectedHallId))
    .filter((booking) => booking.status !== "rejected");

  const getBookingForDate = (date) => {
    const currentStart = toDayStart(date);
    const currentEnd = toDayEnd(date);

    const matchingBookings = filteredBookings.filter((booking) => {
      const start = toDayStart(booking.checkIn);
      const end = toDayEnd(booking.checkOut);

      return (
        currentStart &&
        currentEnd &&
        start &&
        end &&
        currentStart <= end &&
        currentEnd >= start
      );
    });

    if (!matchingBookings.length) {
      return null;
    }

    return [...matchingBookings].sort(
      (left, right) =>
        (STATUS_PRIORITY[right.status] || 0) - (STATUS_PRIORITY[left.status] || 0)
    )[0];
  };

  const days = [];
  const totalDays = getDaysInMonth();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const booking = getBookingForDate(date);

    days.push(
      <div
        key={day}
        className={`${styles.day} ${
          booking
            ? booking.status === "offline"
              ? styles.approved
              : booking.status === "approved"
              ? styles.approved
              : styles.pending
            : ""
        }`}
      >
        <span>{day}</span>
        {booking ? (
          <small className={styles.dayStatus}>
            {booking.status === "offline"
              ? "Booked"
              : booking.status === "approved"
              ? "Approved"
              : "Pending"}
          </small>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <span className={styles.calendarBadge} aria-hidden="true">
          <span className={styles.calendarRingLeft}></span>
          <span className={styles.calendarRingRight}></span>
          <span className={styles.calendarStar}>*</span>
        </span>
        <h1 className={styles.title}>Booking Calendar</h1>
      </div>

      <div className={styles.controls}>
        <label className={styles.field}>
          Hall
          <select
            className={styles.select}
            value={selectedHallId}
            onChange={(event) => setSelectedHallId(event.target.value)}
          >
            {halls.length === 0 ? <option value="">No approved halls</option> : null}
            {halls.map((hall) => (
              <option key={hall._id} value={hall._id}>
                {hall.hallName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.helper}>
        Use the vendor dashboard calendar to create or remove offline booking blocks.
      </p>

      <div className={styles.monthBar}>
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          type="button"
        >
          {"<"}
        </button>

        <h2>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          type="button"
        >
          {">"}
        </button>
      </div>

      <div className={styles.grid}>{days}</div>

      <div className={styles.legend}>
        <span className={styles.legendPending}>Pending</span>
        <span className={styles.legendApproved}>Approved</span>
        <span className={styles.legendOffline}>Offline booked as approved</span>
      </div>
    </div>
  );
}
