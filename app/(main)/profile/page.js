"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import {
  formatBookingTime,
  formatBookingWindow,
} from "../../../lib/bookingSchedule";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "-";

const buildDisplayName = (u) => {
  if (!u) return "User";

  const first = (u.firstName || "").trim();
  const last = (u.lastName || "").trim();
  const merged = `${first} ${last}`.trim();
  if (merged) return merged;

  if (u.name && !String(u.name).includes("@")) return String(u.name).trim();

  if (u.email && String(u.email).includes("@")) {
    return String(u.email).split("@")[0];
  }

  return "User";
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token || !userStr) {
      if (token && !userStr) {
        localStorage.removeItem("token");
      }
      router.replace("/login?redirect=%2Fprofile");
      return;
    }

    try {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse user:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login?redirect=%2Fprofile");
    }
  }, [router]);

  useEffect(() => {
    const syncUserFromApi = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!data?.success || !data?.user) return;

        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const apiUser = data.user || {};

        const mergedUser = {
          ...localUser,
          ...apiUser,
          firstName: apiUser.firstName || localUser.firstName || "",
          lastName: apiUser.lastName || localUser.lastName || "",
        };

        mergedUser.name = buildDisplayName(mergedUser);

        setUser(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser));
      } catch (err) {
        console.error("Failed to sync user profile:", err);
      }
    };

    syncUserFromApi();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMyBookings = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/bookings/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?redirect=%2Fprofile");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load user bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [router, user]);

  const fullName = useMemo(() => {
    return buildDisplayName(user);
  }, [user]);

  const partnerRows = useMemo(() => {
    const seen = new Set();
    return bookings
      .map((b) => ({
        vendorName: b.vendorName || "Venue Partner",
        hallName: b.hallName || "Venue",
      }))
      .filter((row) => {
        const key = `${row.vendorName}|${row.hallName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [bookings]);

  if (!user) {
    return <p className={styles.loading}>Loading profile...</p>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1>My Profile</h1>
        <div className={styles.grid}>
          <div>
            <span>Name</span>
            <p>{fullName}</p>
          </div>
          <div>
            <span>Email</span>
            <p>{user.email || "-"}</p>
          </div>
          <div>
            <span>Phone</span>
            <p>{user.phone || "-"}</p>
          </div>
          <div>
            <span>City</span>
            <p>{user.city || "-"}</p>
          </div>
        </div>
      </section>

      <section className={styles.card} id="bookings">
        <h2>My Bookings</h2>

        {loading && <p className={styles.loading}>Loading bookings...</p>}

        {!loading && bookings.length === 0 && (
          <p className={styles.empty}>
            No bookings found yet for this account.
          </p>
        )}

        {!loading &&
          bookings.map((b) => (
            <Link
              key={b._id}
              href={`/my-bookings/${b._id}`}
              className={styles.bookingCard}
            >
              <div>
                <strong>{b.hallName || "Venue"}</strong>
                <p>{b.eventType || "Event"}</p>
                <small className={styles.bookingHint}>View order summary</small>
              </div>
              <div>
                <span>Status</span>
                <p className={styles[b.status] || styles.pending}>
                  {formatLabel(b.status || "pending")}
                </p>
              </div>
              <div>
                <span>Payment</span>
                <p className={styles[b.paymentStatus] || styles.pending}>
                  {formatLabel(b.paymentStatus || "pending")}
                </p>
                <small className={styles.amountMeta}>
                  {formatCurrency(b.amount)}
                </small>
              </div>
              <div>
                <span>Schedule</span>
                <p>{formatBookingWindow(b)}</p>
                <small className={styles.bookingHint}>
                  {formatBookingTime(b.checkInTime)} {"->"}{" "}
                  {formatBookingTime(b.checkOutTime)}
                </small>
              </div>
            </Link>
          ))}
      </section>

      <section className={styles.card}>
        <h2>Owner / Venue Partner Details</h2>
        {partnerRows.length === 0 ? (
          <p className={styles.empty}>
            Owner details will appear here after your first booking.
          </p>
        ) : (
          partnerRows.map((row, idx) => (
            <div key={`${row.vendorName}-${idx}`} className={styles.partnerCard}>
              <p><span>Owner / Partner</span> {row.vendorName}</p>
              <p><span>Venue</span> {row.hallName}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
