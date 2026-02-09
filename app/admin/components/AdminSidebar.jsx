"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Vendors", href: "/admin/vendors" },
    { name: "Halls", href: "/admin/halls" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Utsavas Admin</div>

      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${
              pathname === link.href ? styles.active : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
