"use client";

import { useState } from "react";
import Select from "react-select";
import "./enquiryPopup.css";

export default function EnquiryPopup({ onClose }) {
  // 🔹 STATES
  const [city, setCity] = useState("Bangalore");
  const [area, setArea] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");

  // 🔥 PREMIUM BANGALORE OPTIONS (clean + no duplicates)
  const bangaloreAreaOptions = [
    { value: "Devanahalli", label: "Devanahalli" },
    { value: "Yelahanka", label: "Yelahanka" },
    { value: "Hebbal", label: "Hebbal" },
    { value: "Jakkur", label: "Jakkur" },
    { value: "Thanisandra", label: "Thanisandra" },
    { value: "Hennur", label: "Hennur" },
    { value: "RT Nagar", label: "RT Nagar" },
    { value: "Whitefield", label: "Whitefield" },
    { value: "KR Puram", label: "KR Puram" },
    { value: "Marathahalli", label: "Marathahalli" },
    { value: "Brookefield", label: "Brookefield" },
    { value: "Varthur", label: "Varthur" },
    { value: "Bellandur", label: "Bellandur" },
    { value: "Mahadevapura", label: "Mahadevapura" },
    { value: "Indiranagar", label: "Indiranagar" },
    { value: "Domlur", label: "Domlur" },
    { value: "Jayanagar", label: "Jayanagar" },
    { value: "JP Nagar", label: "JP Nagar" },
    { value: "Banashankari", label: "Banashankari" },
    { value: "Basavanagudi", label: "Basavanagudi" },
    { value: "BTM Layout", label: "BTM Layout" },
    { value: "Electronic City", label: "Electronic City" },
    { value: "HSR Layout", label: "HSR Layout" },
    { value: "Bannerghatta Road", label: "Bannerghatta Road" },
    { value: "Rajajinagar", label: "Rajajinagar" },
    { value: "Malleshwaram", label: "Malleshwaram" },
    { value: "Yeshwanthpur", label: "Yeshwanthpur" },
    { value: "Vijayanagar", label: "Vijayanagar" },
    { value: "Nagarbhavi", label: "Nagarbhavi" },
    { value: "Kengeri", label: "Kengeri" },
    { value: "Koramangala", label: "Koramangala" },
    { value: "Sarjapur Road", label: "Sarjapur Road" },
  ];

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

    localStorage.setItem("utsavasEnquiry", JSON.stringify(enquiryData));
    localStorage.setItem("enquiryFilled", "true");

    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>Enquiry Form</h2>
        <p>Help us suggest suitable venues for you</p>

        {/* LOCATION */}
        <label>Wedding Location</label>
        <div className="row">
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option>Bangalore</option>
            <option>Chennai</option>
          </select>

          {/* ⭐ PREMIUM SEARCHABLE DROPDOWN */}
          <Select
            options={bangaloreAreaOptions}
            value={bangaloreAreaOptions.find(
              (opt) => opt.value === area
            )}
            onChange={(selected) => setArea(selected?.value || "")}
            placeholder="Search Bangalore area..."
            isSearchable
            className="premium-select"
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>

        {/* GUESTS */}
        <label>Total Guests</label>
        <div className="options">
          {["Upto 100", "100–250", "250–500", "500–750", "1000+ Above"].map(
            (g) => (
              <button
                type="button"
                key={g}
                className={guests === g ? "active" : ""}
                onClick={() => setGuests(g)}
              >
                {g}
              </button>
            )
          )}
        </div>

        {/* BUDGET */}
        <label>Budget</label>
        <div className="options">
          {["₹25k", "₹50k", "₹1L+", "₹2L+", "₹3L+", "₹4L+", "₹5L+ Above"].map(
            (b) => (
              <button
                type="button"
                key={b}
                className={budget === b ? "active" : ""}
                onClick={() => setBudget(b)}
              >
                {b}
              </button>
            )
          )}
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
