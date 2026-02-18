"use client";

import { useState } from "react";
import "./enquiryPopup.css";

export default function EnquiryPopup({ onClose }) {
  // 🔹 STATES
  const [city, setCity] = useState("Bangalore");
  ///const [area, setArea] = useState("Devanahalli");///
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");

  // 🔹 SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!city || !area || !guests || !budget || !date) {
      alert("Please fill all details");
      return;
    }

    const enquiryData = {
      city,
      area,
      guests,
      budget,
      date,
    };

    console.log("Enquiry Submitted:", enquiryData);

    // Save once (optional but recommended)
    localStorage.setItem("utsavasEnquiry", JSON.stringify(enquiryData));
    localStorage.setItem("enquiryFilled", "true");

    // ✅ CLOSE POPUP → DASHBOARD SHOWS
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>Enquiry Form</h2>
        <p>Help us suggest suitable venues for you</p>

        {/* LOCATION */}
        <label>Wedding Location</label>
        <div className="row">
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option>Bangalore</option>
            <option>Chennai</option>
          </select>

          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option>Devanahalli</option>
            <option>Whitefield</option>
          </select>
        </div>

        {/* GUESTS */}
        <label>Total Guests</label>
        <div className="options">
          {["Upto 100", "100–250", "250–500", "500–750", "1000+ Above"].map((g) => (
            <button
              key={g}
              className={guests === g ? "active" : ""}
              onClick={() => setGuests(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* BUDGET */}
        <label>Budget</label>
        <div className="options">
          {["₹25k", "₹50k", "₹1L+", "₹2L+", "₹3L+", "₹4L+", "₹5L+ Above"].map((b) => (
            <button
              key={b}
              className={budget === b ? "active" : ""}
              onClick={() => setBudget(b)}
            >
              {b}
            </button>
          ))}
        </div>

        {/* DATE */}
        <label>Wedding Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* SUBMIT */}
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
