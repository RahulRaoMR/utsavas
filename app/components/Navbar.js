"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "./navbar.css";
import LocationPopup from "./LocationPopup";

export default function Navbar() {
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState("Select Location");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("utsavasLocation");
    if (saved) setLocation(saved);
  }, []);

  const handleSelectLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem("utsavasLocation", loc);
  };

  const clearLocation = (e) => {
    e.stopPropagation();
    localStorage.removeItem("utsavasLocation");
    setLocation("Select Location");
  };

  return (
    <>
      {showLocation && (
        <LocationPopup
          onClose={() => setShowLocation(false)}
          onSelect={handleSelectLocation}
        />
      )}

      <nav className="navbar">
        {/* LOGO */}
        <div className="logo">
          <Link href="/dashboard">
            <img src="/utsavas-logo.png" alt="UTSAVAS" />
          </Link>
        </div>

        {/* DESKTOP LINKS */}
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Venues</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* LOCATION */}
        <div
          className="location-box"
          onClick={() => setShowLocation(true)}
        >
          📍 {location}
          {location !== "Select Location" && (
            <span className="clear-location" onClick={clearLocation}>
              ✖
            </span>
          )}
        </div>

        {/* HAMBURGER (MOBILE ONLY) */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Venues</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}
    </>
  );
}
