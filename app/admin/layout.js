"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/halls/all")
      .then((res) => res.json())
      .then((halls) => {
        const pending = halls.filter(
          (h) => h.status === "pending"
        ).length;
        setPendingCount(pending);
      });
  }, []);

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Utsavas Admin</div>

        <Link
          href="/admin"
          className={`${styles.navLink} ${
            pathname === "/admin" ? styles.active : ""
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/vendors"
          className={`${styles.navLink} ${
            pathname === "/admin/vendors" ? styles.active : ""
          }`}
        >
          Vendors
        </Link>

        <Link
          href="/admin/halls"
          className={`${styles.navLink} ${
            pathname === "/admin/halls" ? styles.active : ""
          }`}
        >
          Halls
          {pendingCount > 0 && (
            <span className={styles.badge}>{pendingCount}</span>
          )}
        </Link>
      </aside>

      {/* PAGE CONTENT */}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
