"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "./navbar.css";
import LocationPopup from "./LocationPopup";

export default function Navbar() {
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState("Select Location");

  useEffect(() => {
    const saved = localStorage.getItem("utsavamLocation");
    if (saved) setLocation(saved);
  }, []);

  const handleSelectLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem("utsavamLocation", loc);
  };

  // 🔥 CLEAR LOCATION
  const clearLocation = (e) => {
    e.stopPropagation(); // prevent popup opening
    localStorage.removeItem("utsavamLocation");
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
        <div className="logo">
          <img src="/utsavam-logo.png" alt="UTSAVAM" />
        </div>

        <div className="nav-links">
          <Link href="/wedding-halls">Wedding Halls</Link>
          <Link href="/banquet-halls">Banquet Halls</Link>
          <Link href="/party-venues">Party Venues</Link>
          <Link href="/services">Services</Link>
        </div>

        {/* LOCATION BOX */}
        <div
          className="location-box"
          onClick={() => setShowLocation(true)}
        >
          📍 {location}

          {/* ❌ Clear button (only show if location selected) */}
          {location !== "Select Location" && (
            <span className="clear-location" onClick={clearLocation}>
              ✖
            </span>
          )}
        </div>
      </nav>
    </>
  );
}
