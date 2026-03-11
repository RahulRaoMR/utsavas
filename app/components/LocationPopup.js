"use client";

import { useState } from "react";
import "./locationPopup.css";
import { karnatakaTaluksAndTowns } from "./karnatakaTaluksAndTowns";
import { getGeolocationErrorMessage } from "./geolocationError";

/* ⭐ Popular quick picks */
const POPULAR_LOCATIONS = [
  "Bengaluru Urban",
  "Mysuru",
  "Mangaluru",
  "Hubballi",
  "Belagavi",
  "Shivamogga",
  "Tumakuru",
  "Kalaburagi",
];

const ALL_LOCATIONS = karnatakaTaluksAndTowns;

export default function LocationPopup({ onClose, onSelect }) {
  const [search, setSearch] = useState("");

  /* ⭐ Filter logic */
  const filteredLocations = ALL_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  /* ⭐ Auto detect location */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    if (!window.isSecureContext) {
      alert(getGeolocationErrorMessage());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();

          if (data.results.length > 0) {
            const address = data.results[0].formatted_address;
            onSelect(address);
            onClose();
          }
        } catch (err) {
          console.error(err);
          alert("Unable to fetch location");
        }
      },
      (error) => {
        alert(getGeolocationErrorMessage(error));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="location-overlay">
      <div className="location-box-popup">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>📍 Select your location</h2>

        {/* AUTO DETECT */}
        <button className="detect-btn" onClick={detectLocation}>
          📡 Use my current location
        </button>

        {/* ⭐ SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search city or area"
          className="location-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <h4>Popular locations</h4>

        {/* ⭐ RESULTS */}
        <div className="location-list">
          {(search ? filteredLocations : POPULAR_LOCATIONS).map((loc) => (
            <div
              key={loc}
              className="location-item"
              onClick={() => {
                onSelect(loc);
                onClose();
              }}
            >
              📍 {loc}
            </div>
          ))}

          {/* ⭐ No results message */}
          {search && filteredLocations.length === 0 && (
            <div className="location-item">No locations found</div>
          )}
        </div>
      </div>
    </div>
  );
}
