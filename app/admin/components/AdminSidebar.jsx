"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vendorStatus = (searchParams.get("status") || "all").toLowerCase();
  const hallStatus = (searchParams.get("status") || "pending").toLowerCase();

  const isActive = (href, matcher) => {
    if (pathname !== href) return false;
    return matcher ? matcher() : true;
  };

  const sections = [
    {
      title: "Overview",
      links: [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Calendar", href: "/admin/bookings" },
        { name: "Bookings", href: "/admin/bookings" },
      ],
    },
    {
      title: "Vendors",
      links: [
        {
          name: "Pending Vendors",
          href: "/admin/vendors?status=pending",
          active: isActive("/admin/vendors", () => vendorStatus === "pending"),
        },
        {
          name: "Total Vendors",
          href: "/admin/vendors?status=all",
          active: isActive("/admin/vendors", () => vendorStatus === "all"),
        },
      ],
    },
    {
      title: "Halls",
      links: [
        {
          name: "Pending Halls",
          href: "/admin/halls?status=pending",
          active: isActive("/admin/halls", () => hallStatus === "pending"),
        },
        {
          name: "Total Halls",
          href: "/admin/halls?status=all",
          active: isActive("/admin/halls", () => hallStatus === "all"),
        },
      ],
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarHeader}>Utsavas Admin</div>
        <p className={styles.sidebarSubtext}>Premium control center</p>
      </div>

      <nav className={styles.navMenu}>
        {sections.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <p className={styles.navSectionLabel}>{section.title}</p>

            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  "active" in link
                    ? link.active
                      ? styles.active
                      : ""
                    : pathname === link.href
                      ? styles.active
                      : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
