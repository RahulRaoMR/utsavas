"use client";

import Link from "next/link";
import "./topnavbar.css";


export default function TopNavBar() {
  return (
    <nav className="top-nav">
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/dashboard">Venues</Link></li>
        <li><Link href="/services">Services</Link></li>
        <li><Link href="/contact">Contact Us</Link></li>
      </ul>

      <Link href="/login" className="login-btn">
        Login
      </Link>
    </nav>
  );
}
