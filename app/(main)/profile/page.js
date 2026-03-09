"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const normalizePhone = (value) => (value || "").toString().replace(/\D/g, "");

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

        const apiUser = data.user;
        setUser(apiUser);
        localStorage.setItem("user", JSON.stringify(apiUser));
      } catch (err) {
        console.error("Failed to sync user profile:", err);
      }
    };

    syncUserFromApi();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userPhone = normalizePhone(user.phone);

    if (!userPhone) {
      setLoading(false);
      return;
    }

    const fetchMyBookings = async () => {
      try {
        const res = await fetch(`${API}/api/bookings/admin/bookings`);
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        const allBookings = Array.isArray(data) ? data : [];

        const mine = allBookings.filter((b) => {
          const bPhone = normalizePhone(b.phone);
          return (
            bPhone === userPhone ||
            bPhone.slice(-10) === userPhone.slice(-10)
          );
        });

        setBookings(mine);
      } catch (error) {
        console.error("Failed to load user bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return "";

    const first = user.firstName || "";
    const last = user.lastName || "";
    const merged = `${first} ${last}`.trim();
    if (merged) return merged;

    if (user.name && !String(user.name).includes("@")) {
      return user.name;
    }

    return "User";
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
            <div key={b._id} className={styles.bookingCard}>
              <div>
                <strong>{b.hallName || "Venue"}</strong>
                <p>{b.eventType || "Event"}</p>
              </div>
              <div>
                <span>Status</span>
                <p className={styles[b.status] || styles.pending}>
                  {b.status || "pending"}
                </p>
              </div>
              <div>
                <span>Dates</span>
                <p>{formatDate(b.checkIn)} to {formatDate(b.checkOut)}</p>
              </div>
            </div>
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
