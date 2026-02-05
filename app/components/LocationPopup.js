"use client";

import "./locationPopup.css";

const POPULAR_LOCATIONS = [
  "JP Nagar",
  "Whitefield",
  "Indiranagar",
  "Yelahanka",
  "Electronic City",
];

export default function LocationPopup({ onClose, onSelect }) {
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
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
      () => {
        alert("Location permission denied");
      }
    );
  };

  return (
    <div className="location-overlay">
      <div className="location-box-popup">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>📍 Select your location</h2>

        {/* AUTO DETECT */}
        <button className="detect-btn" onClick={detectLocation}>
          📡 Use my current location
        </button>

        {/* SEARCH (for next phase) */}
        <input
          type="text"
          placeholder="Search city or area"
          className="location-search"
        />

        <h4>Popular locations</h4>
        <div className="location-list">
          {POPULAR_LOCATIONS.map((loc) => (
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
        </div>
      </div>
    </div>
  );
}
