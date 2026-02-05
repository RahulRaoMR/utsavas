"use client";

import { useState } from "react";
import "./locationPopup.css";

const POPULAR_LOCATIONS = [
  "JP Nagar",
  "Whitefield",
  "Indiranagar",
  "Yelahanka",
  "Electronic City",
];

export default function LocationPopup({ onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     GET CURRENT LOCATION (GPS)
  ========================= */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // 🌍 OpenStreetMap reverse geocoding (FREE)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();

          const location = {
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            area:
              data.address.suburb ||
              data.address.neighbourhood ||
              "",
            lat,
            lng,
          };

          // Save globally
          localStorage.setItem(
            "userLocation",
            JSON.stringify(location)
          );

          onSelect(location);
          onClose();
        } catch (err) {
          alert("Unable to fetch location");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Location permission denied");
        setLoading(false);
      }
    );
  };

  /* =========================
     SEARCH CITY / AREA
  ========================= */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
      );
      const data = await res.json();

      if (!data.length) {
        alert("Location not found");
        return;
      }

      const place = data[0];

      const location = {
        city: place.display_name,
        lat: place.lat,
        lng: place.lon,
      };

      localStorage.setItem(
        "userLocation",
        JSON.stringify(location)
      );

      onSelect(location);
      onClose();
    } catch (err) {
      alert("Search failed");
    }
  };

  return (
    <div className="location-overlay">
      <div className="location-box-popup">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>📍 Select your location</h2>

        {/* AUTO DETECT */}
        <button
          className="detect-btn"
          onClick={detectLocation}
          disabled={loading}
        >
          📡 {loading ? "Detecting..." : "Use my current location"}
        </button>

        {/* SEARCH */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search city or area"
            className="location-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <h4>Popular locations</h4>
        <div className="location-list">
          {POPULAR_LOCATIONS.map((loc) => (
            <div
              key={loc}
              className="location-item"
              onClick={() => {
                const location = { city: loc };
                localStorage.setItem(
                  "userLocation",
                  JSON.stringify(location)
                );
                onSelect(location);
                onClose();
              }}
            >
              📍 {loc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
