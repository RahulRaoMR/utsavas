"use client";

import { useState } from "react";
import Select from "react-select";
import { karnatakaSearchCities } from "./karnatakaSearchCities";
import "./enquiryPopup.css";

export default function EnquiryPopup({ onClose }) {
  const [city, setCity] = useState("Bengaluru");
  const [area, setArea] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");

  const cityOptions = karnatakaSearchCities;
  const selectedCity = cityOptions.find((option) => option.value === city);
  const areaOptions = (selectedCity?.locations || []).map((location) => ({
    value: location,
    label: location,
  }));

  const handleCityChange = (event) => {
    setCity(event.target.value);
    setArea("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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
        <button className="close-btn" type="button" onClick={onClose}>
          X
        </button>

        <h2>Enquiry Form</h2>
        <p>Help us suggest suitable venues for you</p>

        <label>Wedding Location</label>
        <div className="row">
          <select value={city} onChange={handleCityChange}>
            {cityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Select
            options={areaOptions}
            value={areaOptions.find((option) => option.value === area) || null}
            onChange={(selected) => setArea(selected?.value || "")}
            placeholder={`Search ${selectedCity?.label || "Karnataka"} area...`}
            isSearchable
            className="premium-select"
            classNamePrefix="react-select"
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>

        <label>Total Guests</label>
        <div className="options">
          {["Upto 100", "100-250", "250-500", "500-750", "1000+ Above"].map(
            (guestOption) => (
              <button
                type="button"
                key={guestOption}
                className={guests === guestOption ? "active" : ""}
                onClick={() => setGuests(guestOption)}
              >
                {guestOption}
              </button>
            )
          )}
        </div>

        <label>Budget</label>
        <div className="options">
          {["Rs 25k", "Rs 50k", "Rs 1L+", "Rs 2L+", "Rs 3L+", "Rs 4L+", "Rs 5L+ Above"].map(
            (budgetOption) => (
              <button
                type="button"
                key={budgetOption}
                className={budget === budgetOption ? "active" : ""}
                onClick={() => setBudget(budgetOption)}
              >
                {budgetOption}
              </button>
            )
          )}
        </div>

        <label>Wedding Date</label>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <button className="submit-btn" type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
