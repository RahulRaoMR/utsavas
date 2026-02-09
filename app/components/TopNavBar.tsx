"use client";

import Link from "next/link";

export default function TopNavBar() {
  return (
    <nav className="top-nav">
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/dashboard">Venues</Link></li>
        <li><Link href="/location">Location</Link></li>
        <li><Link href="/vendor">Vendors</Link></li>
        <li><Link href="/services">Contact Us</Link></li>
      </ul>

      <Link href="/login" className="login-btn">
        Login
      </Link>
    </nav>
  );
}
