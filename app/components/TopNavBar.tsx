"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./topnavbar.css";

export default function TopNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ⭐ Premium scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭐ Close mobile menu on resize (PRO UX)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ⭐ Prevent body scroll when menu open (PREMIUM FEEL)
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <>
      <nav className={`top-nav ${scrolled ? "scrolled" : ""}`}>
        {/* LEFT — LOGO */}
        <div className="logo">
          <Link href="/">
            <img src="/utsavas-logo.png" alt="UTSAVAS" />
          </Link>
        </div>

        {/* DESKTOP LINKS */}
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/dashboard">Venues</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/contact">Contact Us</Link></li>
        </ul>

        {/* RIGHT */}
        <div className="auth-section">
          <Link href="/vendor/vendor-login" className="list-btn">
            List your property
          </Link>

          <Link href="/register" className="register-btn">
            Register
          </Link>

          <Link href="/login" className="signin-btn">
            Sign in
          </Link>

          {/* ⭐ PREMIUM HAMBURGER */}
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ⭐ MOBILE MENU */}
      <div
        className={`mobile-menu ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Venues</Link>
        <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
      </div>
    </>
  );
}
