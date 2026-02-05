"use client";

import { useEffect, useState } from "react";
import "./dashboard.css";
import EnquiryPopup from "../../components/EnquiryPopup";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  /* =========================
     STATE
  ========================= */
  const [halls, setHalls] = useState([]);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  /* =========================
     FETCH HALLS
  ========================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/halls")
      .then((res) => res.json())
      .then((data) => setHalls(data))
      .catch((err) => console.error(err));

    // enquiry popup
    const filled = localStorage.getItem("enquiryFilled");
    if (!filled) setShowPopup(true);

    // selected location
    const savedLocation = localStorage.getItem("utsavamLocation");
    if (savedLocation) setSelectedLocation(savedLocation);
  }, []);

  /* =========================
     FILTERED SEARCH RESULTS
  ========================= */
  const filteredHalls = halls.filter((hall) => {
    const matchesSearch = hall.hallName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesLocation = selectedLocation
      ? hall.address?.area
          ?.toLowerCase()
          .includes(selectedLocation.toLowerCase()) ||
        hall.address?.city
          ?.toLowerCase()
          .includes(selectedLocation.toLowerCase())
      : true;

    return matchesSearch && matchesLocation;
  });

  /* =========================
     OPEN HALL PAGE
  ========================= */
  const openHall = (hall) => {
    if (hall.category === "wedding") {
      router.push(`/wedding-halls/${hall._id}`);
    } else if (hall.category === "banquet") {
      router.push(`/banquet-halls/${hall._id}`);
    } else {
      router.push(`/party-venues/${hall._id}`);
    }
  };

  return (
    <>
      {/* ENQUIRY POPUP */}
      {showPopup && (
        <EnquiryPopup onClose={() => setShowPopup(false)} />
      )}

      {/* DASHBOARD */}
      <div className="dashboard-container">
        <div className="overlay">
          <h1 className="title">Welcome to UTSAVAM</h1>
          <p className="subtitle">
            Where UTSAVAM Become Memories
          </p>

          {/* ================= SEARCH ================= */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search venues"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="search-btn">Search</button>

            {/* SEARCH DROPDOWN */}
            {search && filteredHalls.length > 0 && (
              <div className="search-results">
                {filteredHalls.slice(0, 6).map((hall) => (
                  <div
                    key={hall._id}
                    className="search-item"
                    onClick={() => openHall(hall)}
                  >
                    <strong>{hall.hallName}</strong>
                    <p>
                      {hall.address?.area},{" "}
                      {hall.address?.city}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= CATEGORY CARDS ================= */}
          <div className="card-container">
            <div
              className="card wedding"
              onClick={() => router.push("/wedding-halls")}
            >
              Wedding Halls
            </div>

            <div
              className="card banquet"
              onClick={() => router.push("/banquet-halls")}
            >
              Banquet Halls
            </div>

            <div
              className="card party"
              onClick={() => router.push("/party-venues")}
            >
              Party Venues
            </div>
          </div>

          {/* ================= PREVIEW HALLS ================= */}
          <div className="hall-grid">
            {filteredHalls.slice(0, 3).map((hall) => (
              <div
                key={hall._id}
                className="hall-card"
                onClick={() => openHall(hall)}
              >
                <h3>{hall.hallName}</h3>
                <p>
                  {hall.address?.area},{" "}
                  {hall.address?.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
