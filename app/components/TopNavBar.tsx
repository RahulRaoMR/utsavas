"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./topnavbar.css";

export default function TopNavBar() {

  const router = useRouter();

  const dropdownRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location, setLocation] = useState("");

  /* =========================
     SCROLL SHADOW
  ========================= */

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  /* =========================
     CLOSE MOBILE MENU
  ========================= */

  useEffect(() => {

    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  /* =========================
     BODY LOCK
  ========================= */

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {

    try {

      const userStr = localStorage.getItem("user");
      const vendorStr = localStorage.getItem("vendor");

      let storedUser = null;

      if (userStr) {
        storedUser = JSON.parse(userStr);
      }

      else if (vendorStr) {
        storedUser = JSON.parse(vendorStr);
      }

      if (storedUser) {
        setUser(storedUser);
      }

    } catch (err) {
      console.error("User parse error:", err);
    }

  }, []);

  /* =========================
     CLOSE DROPDOWN CLICK
  ========================= */

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("vendor");

    setUser(null);

    router.push("/");

  };

  /* =========================
     LOCATION SEARCH
  ========================= */

  const handleLocationSearch = () => {

    if (!location.trim()) return;

    router.push(`/dashboard?city=${encodeURIComponent(location)}`);

  };

  /* =========================
     GET DISPLAY NAME
  ========================= */

  const displayName =
    user?.name ||
    user?.ownerName ||
    user?.businessName ||
    "Guest";

  const avatarLetter =
    displayName.charAt(0).toUpperCase();

  return (
    <>

      <nav className={`top-nav ${scrolled ? "scrolled" : ""}`}>

        {/* LOGO */}

        <div className="logo">
          <Link href="/">
            <img src="/utsavas-logo.png" alt="UTSAVAS" />
          </Link>
        </div>

        {/* LOCATION SEARCH */}

        <div className="location-bar">
          <input
            type="text"
            placeholder="Where are you going?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button onClick={handleLocationSearch}>🔍</button>
        </div>

        {/* DESKTOP LINKS */}

        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/dashboard">Venues</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/contact">Contact Us</Link></li>
        </ul>

        {/* RIGHT SIDE */}

        <div className="auth-section">

          {/* BEFORE LOGIN */}

          {!user && (
            <>
              <Link href="/vendor/vendor-login" className="list-btn">
                List your property
              </Link>

              <Link href="/register" className="register-btn">
                Register
              </Link>

              <Link href="/login" className="signin-btn">
                Sign in
              </Link>
            </>
          )}

          {/* AFTER LOGIN */}

          {user && (

            <div className="user-wrapper" ref={dropdownRef}>

              <div
                className="user-chip"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >

                <div className="avatar">
                  {avatarLetter}
                </div>

                <span className="user-name">
                  {displayName}
                </span>

              </div>

              {dropdownOpen && (

                <div className="user-dropdown">

                  <Link href="/profile">My Profile</Link>

                  <Link href="/my-bookings">
                    My Bookings
                  </Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>

                </div>

              )}

            </div>

          )}

          {/* HAMBURGER */}

          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >

            <span></span>
            <span></span>
            <span></span>

          </button>

        </div>

      </nav>

      {/* MOBILE MENU */}

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>

        <Link href="/">Home</Link>
        <Link href="/dashboard">Venues</Link>
        <Link href="/services">Services</Link>
        <Link href="/contact">Contact</Link>

        {!user && (
          <>
            <Link href="/vendor/vendor-login" className="mobile-btn">
              List your property
            </Link>

            <Link href="/register" className="mobile-btn">
              Register
            </Link>

            <Link href="/login" className="mobile-btn">
              Sign in
            </Link>
          </>
        )}

        {user && (
          <>
            <Link href="/profile">My Profile</Link>

            <Link href="/my-bookings">
              My Bookings
            </Link>

            <button
              onClick={handleLogout}
              className="mobile-btn"
            >
              Logout
            </button>
          </>
        )}

      </div>

    </>
  );
}