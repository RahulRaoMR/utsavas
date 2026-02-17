"use client";

import Link from "next/link";
import "./topnavbar.css";

export default function TopNavBar() {
  return (
    <nav className="top-nav">
      {/* LEFT NAV LINKS */}
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/dashboard">Venues</Link></li>
        <li><Link href="/services">Services</Link></li>
        <li><Link href="/contact">Contact Us</Link></li>
      </ul>

      {/* RIGHT AUTH SECTION */}
      <div className="auth-section">

        {/* ⭐ LIST PROPERTY BUTTON */}
        <Link href="/vendor/vendor-login" className="list-btn">
          List your property
        </Link>

        <Link href="/register" className="register-btn">
          Register
        </Link>

        <Link href="/login" className="signin-btn">
          Sign in
        </Link>
      </div>
    </nav>
  );
}
