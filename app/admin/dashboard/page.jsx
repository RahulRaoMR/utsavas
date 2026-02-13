"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";


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
        const res = await fetch(
          "http://localhost:5000/api/admin/dashboard-stats"
        );

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
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
          <div className={styles.card}>
            <h3>Total Vendors</h3>
            <p className={styles.count}>{stats.totalVendors}</p>
          </div>

          <div className={styles.card}>
            <h3>Pending Vendors</h3>
            <p className={styles.count}>{stats.pendingVendors}</p>
          </div>

          <div className={styles.card}>
            <h3>Total Halls</h3>
            <p className={styles.count}>{stats.totalHalls}</p>
          </div>

          <div className={styles.card}>
            <h3>Pending Halls</h3>
            <p className={styles.count}>{stats.pendingHalls}</p>
          </div>
        </div>
      </div>

    
    </div>
  );
}
