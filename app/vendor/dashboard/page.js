"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../vendorDashboard.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const STATUS_PRIORITY = {
  offline: 3,
  approved: 2,
  pending: 1,
  rejected: 0,
};

const getVendorSession = () => {
  if (typeof window === "undefined") {
    return {
      token: "",
      vendor: null,
      vendorId: "",
    };
  }

  const rawVendor = localStorage.getItem("vendor");
  const vendor = rawVendor ? JSON.parse(rawVendor) : null;

  return {
    token: localStorage.getItem("vendorToken") || "",
    vendor,
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

const formatDateKey = (value) => {
  const date = toDayStart(value);

  if (!date) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const formatDisplayDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const rangesOverlap = (startA, endA, startB, endB) =>
  startA <= endB && endA >= startB;

const getHallIdFromItem = (item) =>
  String(item?.hall?._id || item?.hallId || item?.hall || "");

const getStatusClassName = (status) => {
  if (status === "offline") return styles.approved;
  if (status === "approved") return styles.approved;
  if (status === "pending") return styles.pending;
  return "";
};

export default function VendorDashboard() {
  const router = useRouter();

  const [vendor, setVendor] = useState(null);
  const [halls, setHalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHallId, setSelectedHallId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [offlineStart, setOfflineStart] = useState("");
  const [offlineEnd, setOfflineEnd] = useState("");
  const [savingOfflineBooking, setSavingOfflineBooking] = useState(false);
  const [removingOfflineBooking, setRemovingOfflineBooking] = useState(false);

  const loadDashboard = useCallback(async (preferredHallId = "") => {
    const session = getVendorSession();

    if (!session.vendor || !session.vendorId || !session.token) {
      router.replace("/vendor/vendor-login");
      return;
    }

    setVendor(session.vendor);

    try {
      const headers = getVendorHeaders(session.token);

      const [hallsRes, bookingsRes] = await Promise.allSettled([
        fetch(`${API}/api/halls/vendor/${session.vendorId}`, {
          cache: "no-store",
          headers,
        }),
        fetch(`${API}/api/bookings/vendor/${session.vendorId}`, {
          cache: "no-store",
          headers,
        }),
      ]);

      let resolvedHalls = [];
      if (hallsRes.status === "fulfilled" && hallsRes.value.ok) {
        const hallPayload = await hallsRes.value.json();
        resolvedHalls = Array.isArray(hallPayload?.data) ? hallPayload.data : [];
      }

      let resolvedBookings = [];
      if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
        const bookingsPayload = await bookingsRes.value.json();
        resolvedBookings = Array.isArray(bookingsPayload) ? bookingsPayload : [];
      }

      setHalls(resolvedHalls);
      setBookings(resolvedBookings);
      setSelectedHallId((currentValue) => {
        const nextValue = preferredHallId || currentValue;
        const matchedHall = resolvedHalls.find(
          (hall) => String(hall._id) === String(nextValue)
        );

        return matchedHall?._id || resolvedHalls[0]?._id || "";
      });
    } catch (error) {
      console.error("Error loading vendor dashboard", error);
      setHalls([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorToken");
    router.replace("/vendor/vendor-login");
  };

  const selectedHall = halls.find(
    (hall) => String(hall._id) === String(selectedHallId)
  );

  const calendarItems = bookings
    .filter((booking) => String(getHallIdFromItem(booking)) === String(selectedHallId))
    .filter((booking) => booking.status !== "rejected");

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getBookingForDate = (date) => {
    const dayStart = toDayStart(date);
    const dayEnd = toDayEnd(date);

    if (!dayStart || !dayEnd) {
      return null;
    }

    const matches = calendarItems.filter((booking) => {
      const bookingStart = toDayStart(booking.checkIn);
      const bookingEnd = toDayEnd(booking.checkOut);

      if (!bookingStart || !bookingEnd) {
        return false;
      }

      return rangesOverlap(dayStart, dayEnd, bookingStart, bookingEnd);
    });

    if (!matches.length) {
      return null;
    }

    return [...matches].sort(
      (left, right) =>
        (STATUS_PRIORITY[right.status] || 0) - (STATUS_PRIORITY[left.status] || 0)
    )[0];
  };

  const getDraftRange = () => {
    if (!offlineStart) {
      return null;
    }

    const rangeStart = toDayStart(offlineStart);
    const rangeEnd = toDayEnd(offlineEnd || offlineStart);

    if (!rangeStart || !rangeEnd) {
      return null;
    }

    return {
      start: rangeStart <= rangeEnd ? rangeStart : toDayStart(offlineEnd || offlineStart),
      end: rangeStart <= rangeEnd ? rangeEnd : toDayEnd(offlineStart),
    };
  };

  const draftRange = getDraftRange();

  const isDateInDraftRange = (date) => {
    if (!draftRange) {
      return false;
    }

    const current = toDayStart(date);
    return current && current >= draftRange.start && current <= draftRange.end;
  };

  const resetOfflineDraft = () => {
    setOfflineStart("");
    setOfflineEnd("");
  };

  const handleCalendarDayClick = (date) => {
    const booking = getBookingForDate(date);

    if (booking) {
      setSelectedBooking(booking);
      setShowModal(true);
      return;
    }

    if (!selectedHallId) {
      alert("Select a hall before blocking offline dates.");
      return;
    }

    const clickedDate = formatDateKey(date);

    if (!offlineStart || (offlineStart && offlineEnd)) {
      setOfflineStart(clickedDate);
      setOfflineEnd("");
      return;
    }

    if (clickedDate < offlineStart) {
      setOfflineEnd(offlineStart);
      setOfflineStart(clickedDate);
      return;
    }

    setOfflineEnd(clickedDate);
  };

  const handleCreateOfflineBooking = async () => {
    const session = getVendorSession();

    if (!session.token || !session.vendorId) {
      alert("Vendor session expired. Please login again.");
      router.replace("/vendor/vendor-login");
      return;
    }

    if (!selectedHallId) {
      alert("Please select a hall first.");
      return;
    }

    if (!offlineStart) {
      alert("Select a start date for the offline booking.");
      return;
    }

    const rangeStart = toDayStart(offlineStart);
    const rangeEnd = toDayEnd(offlineEnd || offlineStart);

    if (!rangeStart || !rangeEnd) {
      alert("Please select valid dates.");
      return;
    }

    const overlappingBlockedDate = calendarItems.find((booking) => {
      if (!["approved", "offline"].includes(booking.status)) {
        return false;
      }

      const bookingStart = toDayStart(booking.checkIn);
      const bookingEnd = toDayEnd(booking.checkOut);
      return (
        bookingStart &&
        bookingEnd &&
        rangesOverlap(rangeStart, rangeEnd, bookingStart, bookingEnd)
      );
    });

    if (overlappingBlockedDate) {
      alert("These dates are already unavailable in the calendar.");
      return;
    }

    const hasPendingConflict = calendarItems.some((booking) => {
      if (booking.status !== "pending") {
        return false;
      }

      const bookingStart = toDayStart(booking.checkIn);
      const bookingEnd = toDayEnd(booking.checkOut);
      return (
        bookingStart &&
        bookingEnd &&
        rangesOverlap(rangeStart, rangeEnd, bookingStart, bookingEnd)
      );
    });

    if (
      hasPendingConflict &&
      !confirm("These dates already have pending booking requests. Mark them as offline booked anyway?")
    ) {
      return;
    }

    try {
      setSavingOfflineBooking(true);

      const res = await fetch(`${API}/api/halls/${selectedHallId}/offline-bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getVendorHeaders(session.token),
        },
        body: JSON.stringify({
          startDate: offlineStart,
          endDate: offlineEnd || offlineStart,
          note: "Offline booked",
        }),
      });

      const rawResponse = await res.text();
      let data = {};
      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        data = {
          message: rawResponse || "",
        };
      }

      if (!res.ok) {
        alert(data?.message || "Failed to block offline booking dates.");
        return;
      }

      await loadDashboard(selectedHallId);
      resetOfflineDraft();
      alert("Offline booking dates blocked successfully.");
    } catch (error) {
      console.error("Offline booking create error", error);
      alert("Failed to block offline booking dates.");
    } finally {
      setSavingOfflineBooking(false);
    }
  };

  const handleRemoveOfflineBooking = async () => {
    if (!selectedBooking || selectedBooking.status !== "offline") {
      return;
    }

    const session = getVendorSession();

    if (!session.token || !session.vendorId) {
      alert("Vendor session expired. Please login again.");
      router.replace("/vendor/vendor-login");
      return;
    }

    const hallId = getHallIdFromItem(selectedBooking);
    const offlineBookingId = selectedBooking.offlineBookingId;

    if (!hallId || !offlineBookingId) {
      alert("Offline booking block details are missing.");
      return;
    }

    if (!confirm("Remove this offline booking block?")) {
      return;
    }

    try {
      setRemovingOfflineBooking(true);

      const res = await fetch(
        `${API}/api/halls/${hallId}/offline-bookings/${offlineBookingId}`,
        {
          method: "DELETE",
          headers: getVendorHeaders(session.token),
        }
      );

      const rawResponse = await res.text();
      let data = {};
      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        data = {
          message: rawResponse || "",
        };
      }

      if (!res.ok) {
        alert(data?.message || "Failed to remove offline booking block.");
        return;
      }

      setShowModal(false);
      setSelectedBooking(null);
      await loadDashboard(selectedHallId);
      alert("Offline booking block removed successfully.");
    } catch (error) {
      console.error("Offline booking remove error", error);
      alert("Failed to remove offline booking block.");
    } finally {
      setRemovingOfflineBooking(false);
    }
  };

  const realBookings = bookings.filter((booking) => booking.status !== "offline");

  const monthlyBookings = realBookings.filter((booking) => {
    const checkIn = new Date(booking.checkIn);
    return (
      checkIn.getMonth() === currentMonth.getMonth() &&
      checkIn.getFullYear() === currentMonth.getFullYear()
    );
  });

  const approvedBookings = monthlyBookings.filter(
    (booking) => booking.status === "approved"
  );

  const pendingBookings = monthlyBookings.filter(
    (booking) => booking.status === "pending"
  );

  const estimatedRevenue = approvedBookings.length * 50000;

  const displayOwnerName =
    vendor?.ownerName || vendor?.name || vendor?.businessName || "-";
  const displayEmail = vendor?.email || "-";
  const displayCity = vendor?.city || vendor?.address?.city || "-";

  if (loading) {
    return <p className={styles.loading}>Loading dashboard...</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>UTSAVAS</div>
        <button className={styles.logoutBtn} onClick={handleLogout} type="button">
          Logout
        </button>
      </div>

      <div className={styles.welcomeBox}>
        <h1>Welcome, {vendor?.businessName || "Vendor"}</h1>
        <p>
          Manage your halls, booking requests, and offline availability with{" "}
          <b>UTSAVAS</b>.
        </p>

        <p className={styles.muted}>
          <b>Owner:</b> {displayOwnerName} &nbsp;|&nbsp;
          <b>Email:</b> {displayEmail} &nbsp;|&nbsp;
          <b>City:</b> {displayCity}
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.card} onClick={() => router.push("/vendor/add-hall")}>
          <div className={styles.cardIcon}>+</div>
          <div className={styles.cardTitle}>Add New Hall</div>
          <div className={styles.muted}>Create a new venue listing</div>
        </div>

        <div className={styles.card} onClick={() => router.push("/vendor/my-halls")}>
          <div className={styles.cardIcon}>Hall</div>
          <div className={styles.cardTitle}>My Halls</div>
          <div className={styles.muted}>View and manage your halls</div>
        </div>

        <div className={styles.card} onClick={() => router.push("/vendor/bookings")}>
          <div className={styles.cardIcon}>Cal</div>
          <div className={styles.cardTitle}>Booking Requests</div>
          <div className={styles.muted}>Manage customer bookings</div>
        </div>
      </div>

      <div className={styles.calendarSection}>
        <h2 className={styles.calendarTitle}>Booking Calendar</h2>

        <div className={styles.calendarControls}>
          <label className={styles.calendarField}>
            Hall
            <select
              className={styles.calendarSelect}
              value={selectedHallId}
              onChange={(event) => {
                setSelectedHallId(event.target.value);
                resetOfflineDraft();
              }}
            >
              {halls.length === 0 ? (
                <option value="">No approved halls</option>
              ) : null}
              {halls.map((hall) => (
                <option key={hall._id} value={hall._id}>
                  {hall.hallName}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.calendarField}>
            From
            <input
              className={styles.calendarInput}
              type="date"
              value={offlineStart}
              onChange={(event) => setOfflineStart(event.target.value)}
              disabled={!selectedHallId}
            />
          </label>

          <label className={styles.calendarField}>
            To
            <input
              className={styles.calendarInput}
              type="date"
              value={offlineEnd}
              min={offlineStart || undefined}
              onChange={(event) => setOfflineEnd(event.target.value)}
              disabled={!selectedHallId || !offlineStart}
            />
          </label>

          <button
            className={styles.blockButton}
            onClick={handleCreateOfflineBooking}
            type="button"
            disabled={!selectedHallId || !offlineStart || savingOfflineBooking}
          >
            {savingOfflineBooking ? "Saving..." : "Mark Offline Booked"}
          </button>

          <button
            className={styles.clearButton}
            onClick={resetOfflineDraft}
            type="button"
            disabled={!offlineStart && !offlineEnd}
          >
            Clear
          </button>
        </div>

        <p className={styles.calendarHelper}>
          {selectedHall
            ? `Managing availability for ${selectedHall.hallName}. Click one day or a date range to block offline bookings.`
            : "Select a hall first to manage offline booking blocks."}
        </p>

        {draftRange ? (
          <p className={styles.selectionSummary}>
            Offline block selection: {formatDisplayDate(draftRange.start)} to{" "}
            {formatDisplayDate(draftRange.end)}
          </p>
        ) : null}

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
            type="button"
          >
            {"<"}
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
            type="button"
          >
            {">"}
          </button>
        </div>

        <div className={styles.calendarGrid}>
          {Array.from({ length: getDaysInMonth() }).map((_, index) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              index + 1
            );
            const booking = getBookingForDate(date);

            return (
              <button
                key={index}
                type="button"
                className={[
                  styles.day,
                  booking ? getStatusClassName(booking.status) : "",
                  !booking && isDateInDraftRange(date) ? styles.dayDraft : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleCalendarDayClick(date)}
              >
                <span>{index + 1}</span>
                {booking ? (
                  <small className={styles.dayStatus}>
                    {booking.status === "offline"
                      ? "Booked"
                      : booking.status === "approved"
                      ? "Approved"
                      : "Pending"}
                  </small>
                ) : isDateInDraftRange(date) ? (
                  <small className={styles.dayStatus}>Selected</small>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className={styles.legend}>
          <span className={styles.legendPending}>Pending</span>
          <span className={styles.legendApproved}>Approved</span>
          <span className={styles.legendOffline}>Offline booked as approved</span>
        </div>
      </div>

      <div className={styles.revenueSection}>
        <h2 className={styles.revenueTitle}>Monthly Revenue Summary</h2>

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
            <h3>Rs {estimatedRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {showModal && selectedBooking ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Calendar Details</h2>

            <p>
              <span>Hall:</span> {selectedBooking.hall?.hallName || "N/A"}
            </p>
            <p>
              <span>Dates:</span> {formatDisplayDate(selectedBooking.checkIn)} to{" "}
              {formatDisplayDate(selectedBooking.checkOut)}
            </p>
            <p>
              <span>Status:</span>{" "}
              <b>
                {selectedBooking.status === "offline"
                  ? "OFFLINE BOOKED"
                  : String(selectedBooking.status || "").toUpperCase()}
              </b>
            </p>

            {selectedBooking.status === "offline" ? (
              <p>
                <span>Note:</span> {selectedBooking.note || "Offline booked"}
              </p>
            ) : (
              <>
                <p>
                  <span>Customer:</span> {selectedBooking.customerName || "-"}
                </p>
                <p>
                  <span>Phone:</span> {selectedBooking.phone || "-"}
                </p>
                <p>
                  <span>Event:</span> {selectedBooking.eventType || "-"}
                </p>
                <p>
                  <span>Guests:</span> {selectedBooking.guests || "N/A"}
                </p>
              </>
            )}

            <div className={styles.modalActions}>
              {selectedBooking.status === "offline" ? (
                <button
                  className={styles.deleteOfflineBtn}
                  onClick={handleRemoveOfflineBooking}
                  type="button"
                  disabled={removingOfflineBooking}
                >
                  {removingOfflineBooking ? "Removing..." : "Remove Offline Block"}
                </button>
              ) : null}

              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
