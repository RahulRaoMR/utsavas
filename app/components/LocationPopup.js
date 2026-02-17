"use client";

import { useState } from "react";
import "./locationPopup.css";

/* ⭐ Popular quick picks */
const POPULAR_LOCATIONS = [
  "JP Nagar",
  "Whitefield",
  "Indiranagar",
  "Yelahanka",
  "Electronic City",
];

/* ⭐ Full Bangalore areas list */
const ALL_LOCATIONS = [
  "Indiranagar",
  "Whitefield",
  "MG Road",
  "Ulsoor",
  "Marathahalli",
  "KR Puram",
  "Jayanagar",
  "JP Nagar",
  "Banashankari",
  "BTM Layout",
  "Electronic City",
  "Bannerghatta Road",
  "Hebbal",
  "Yelahanka",
  "Devanahalli",
  "Rajajinagar",
  "Malleswaram",
  "Sarjapur Road",
  // Core Areas
  "Indiranagar",
  "Whitefield",
  "MG Road",
  "Ulsoor",
  "Marathahalli",
  "KR Puram",
  "Jayanagar",
  "JP Nagar",
  "Banashankari",
  "BTM Layout",
  "Electronic City",
  "Bannerghatta Road",
  "Hebbal",
  "Yelahanka",
  "Devanahalli",
  "Rajajinagar",
  "Malleswaram",
  "Sarjapur Road",
  "Bellandur",
  "HSR Layout",
  "Koramangala",
  "Frazer Town",
  "Basavanagudi",
  "Vijayanagar",
  "Kengeri",
  "Nagarbhavi",
  "Yeshwanthpur",
  "Peenya",
  "Bommanahalli",
  "Hennur",
  "Thanisandra",
  "RT Nagar",

  // 🔥 Major  Stations (Purple + Green focus)
  "MG Road ",
  "Indiranagar ",
  "Halasuru ",
  "Trinity ",
  "Cubbon Park ",
  "Vidhana Soudha ",
  "Sir M Visvesvaraya Station",
  "Majestic ",
  "City Railway Station ",
  "Magadi Road ",
  "Hosahalli ",
  "Vijayanagar ",
  "Attiguppe ",
  "Deepanjali Nagar ",
  "Mysore Road ",
  "Baiyappanahalli ",
  "Swami Vivekananda Road ",
  "Garudacharpalya ",
  "Mahadevapura ",
  "KR Puram ",
  "Benniganahalli ",

  // 🟢 Green Line key stations
  "Yeshwanthpur ",
  "Sandal Soap Factory ",
  "Mahalakshmi ",
  "Rajajinagar ",
  "Kuvempu Road ",
  "Srirampura ",
  "Sampige Road ",
  "Chickpete ",
  "National College ",
  "Lalbagh ",
  "South End Circle ",
  "Jayanagar ",
  "Rashtreeya Vidyalaya Road ",
  "Banashankari ",
  "JP Nagar ",
  "Yelachenahalli ",
];

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
