"use client";

import { useState } from "react";
import "./filtersSidebar.css";

export default function FiltersSidebar({
  priceRange = { min: 0, max: 300000 }, // ✅ SAFETY FIX
  setPriceRange = () => {},
}) {
  /* =========================
     PRICE HANDLERS
  ========================= */
  const handleMinChange = (e) => {
    setPriceRange((prev) => ({
      ...prev,
      min: Number(e.target.value),
    }));
  };

  const handleMaxChange = (e) => {
    setPriceRange((prev) => ({
      ...prev,
      max: Number(e.target.value),
    }));
  };

  /* =========================
     FILTER STATE (UI ONLY)
  ========================= */
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  /* =========================
     DATA LISTS
  ========================= */

  // ⭐ HOTEL STYLE FACILITIES
  const hotelFacilities = [
    "Parking",
    "Restaurant",
    "Room service",
    "24-hour front desk",
    "Fitness centre",
    "Non-smoking rooms",
    "Airport shuttle",
    "Spa and wellness centre",
    "Hot tub/Jacuzzi",
    "Free WiFi",
    "Electric vehicle charging station",
    "Wheelchair accessible",
    "Swimming pool",
  ];

  // ⭐ NEW — WEDDING FACILITIES (YOUR IMAGE)
  const weddingFacilities = [
    "Dining Hall",
    "Power Backup",
    "Non-AC Hall",
    "Outside Decorators Allowed",
    "Alcohol Allowed",
    "Stage",
    "Air Conditioning",
    "Outside Food Allowed",
    "Outside DJ Allowed",
    "Valet Parking",
  ];

  const distanceOptions = [
    "Less than 1 km",
    "Less than 3 km",
    "Less than 5 km",
  ];

  const ratingOptions = [
    "1 star",
    "2 stars",
    "3 stars",
    "4 stars",
    "5 stars",
  ];

  const mealOptions = [
    "Self catering",
    "Breakfast included",
    "All meals included",
    "Breakfast & dinner included",
  ];

  /* =========================
     UI
  ========================= */
  return (
    <aside className="filters-sidebar">
      <h3 className="filter-title">Filters</h3>

      {/* ================= PRICE ================= */}
      <div className="filter-group">
        <label className="filter-label">Price Range</label>

        <input
          type="range"
          min="0"
          max="300000"
          step="5000"
          value={priceRange.max}
          onChange={handleMaxChange}
          className="price-slider"
        />

        <div className="price-values">
          <span>₹{priceRange.min}</span>
          <span>₹{priceRange.max}+</span>
        </div>
      </div>

      {/* ================= WEDDING FACILITIES ================= */}
      <div className="filter-group">
        <label className="filter-label">✨ Facilities</label>

        <div className="filter-options">
          {weddingFacilities.map((item) => (
            <label key={item} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedFilters.includes(item)}
                onChange={() => toggleFilter(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= HOTEL FACILITIES ================= */}
      <div className="filter-group">
        <label className="filter-label">Amenities</label>

        <div className="filter-options">
          {hotelFacilities.map((item) => (
            <label key={item} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedFilters.includes(item)}
                onChange={() => toggleFilter(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= DISTANCE ================= */}
      <div className="filter-group">
        <label className="filter-label">Distance from centre</label>

        <div className="filter-options">
          {distanceOptions.map((item) => (
            <label key={item} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedFilters.includes(item)}
                onChange={() => toggleFilter(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= RATING ================= */}
      <div className="filter-group">
        <label className="filter-label">Property rating</label>

        <div className="filter-options">
          {ratingOptions.map((item) => (
            <label key={item} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedFilters.includes(item)}
                onChange={() => toggleFilter(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= MEALS ================= */}
      <div className="filter-group">
        <label className="filter-label">Meals</label>

        <div className="filter-options">
          {mealOptions.map((item) => (
            <label key={item} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedFilters.includes(item)}
                onChange={() => toggleFilter(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ================= ONLINE PAYMENT ================= */}
      <div className="filter-group">
        <label className="filter-label">Online payment</label>

        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={selectedFilters.includes("Accepts online payments")}
            onChange={() => toggleFilter("Accepts online payments")}
          />
          <span>Accepts online payments</span>
        </label>
      </div>

      {/* ================= CANCELLATION ================= */}
      <div className="filter-group">
        <label className="filter-label">Reservation policy</label>

        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={selectedFilters.includes("Free cancellation")}
            onChange={() => toggleFilter("Free cancellation")}
          />
          <span>Free cancellation</span>
        </label>
      </div>
    </aside>
  );
}
