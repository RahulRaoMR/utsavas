"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminToken,
} from "../../../lib/panelAuth";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalVendors: 0,
    totalHalls: 0,
    pendingHalls: 0,
    pendingVendors: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = getAdminToken();

        if (!adminToken) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const res = await fetch(`${API}/api/admin/dashboard-stats`, {
          headers: getAdminAuthHeaders(),
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();

        setStats({
          totalVendors: data.totalVendors || 0,
          totalHalls: data.totalHalls || 0,
          pendingHalls: data.pendingHalls || 0,
          pendingVendors: data.pendingVendors || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const intervalId = window.setInterval(fetchStats, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchStats();
    };

    window.addEventListener("focus", fetchStats);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchStats);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  if (loading) {
    return <p className={styles.loading}>Loading dashboard...</p>;
  }

  return (
    <div>
      <div className={styles.container}>
        {/* TOP HEADER */}
        <div className={styles.topHeader}>
          <h1 className={styles.header}>Utsavas Admin Dashboard</h1>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div className={styles.cardGrid}>
          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/vendors?status=all")}
          >
            <h3>Total Vendors</h3>
            <p className={styles.count}>{stats.totalVendors}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/vendors?status=pending")}
          >
            <h3>Pending Vendors</h3>
            <p className={styles.count}>{stats.pendingVendors}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/halls?status=all")}
          >
            <h3>Total Halls</h3>
            <p className={styles.count}>{stats.totalHalls}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/halls?status=pending")}
          >
            <h3>Pending Halls</h3>
            <p className={styles.count}>{stats.pendingHalls}</p>
          </button>
        </div>
      </div>

    
    </div>
  );
}
