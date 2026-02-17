"use client";

import { useEffect, useState, useRef } from "react";
import "./dashboard.css";
import EnquiryPopup from "../../components/EnquiryPopup";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";

export default function Dashboard() {
  const router = useRouter();
  const searchRef = useRef(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  /* ===================================
     🔒 AUTH GUARD (VERY IMPORTANT)
  =================================== */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login"); // 🚀 prevents back navigation
      return;
    }

    // existing popup logic
    const filled = localStorage.getItem("enquiryFilled");
    if (!filled) setShowPopup(true);

    const savedLocation = localStorage.getItem("utsavasLocation");
    if (savedLocation) setSelectedLocation(savedLocation);
  }, [router]);

  /* ===================================
     🔍 SEARCH API
  =================================== */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/halls/search?q=${search}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  /* ===================================
     🏛 OPEN HALL
  =================================== */
  const openHall = (hall) => {
    setResults([]);

    if (hall.category === "wedding") {
      router.push(`/wedding-halls/${hall._id}`);
    } else if (hall.category === "banquet") {
      router.push(`/banquet-halls/${hall._id}`);
    } else {
      router.push(`/party-venues/${hall._id}`);
    }
  };

  const handleSearchSubmit = () => {
    if (results.length > 0) {
      openHall(results[0]);
    }
  };

  /* ===================================
     🖱 CLICK OUTSIDE SEARCH
  =================================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {showPopup && (
        <EnquiryPopup onClose={() => setShowPopup(false)} />
      )}

      <div className="dashboard-container">
        <div className="overlay">
          <h1 className="title">Welcome to UTSAVAS</h1>
          <p className="subtitle">
            Where UTSAVAS Become Memories
          </p>

          <div className="search-wrapper" ref={searchRef}>
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search venues"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearchSubmit()
              }
            />

            <button
              className="search-btn"
              onClick={handleSearchSubmit}
            >
              Search
            </button>

            {results.length > 0 && (
              <div className="search-results">
                {results.slice(0, 6).map((hall) => (
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

            {loading && (
              <div className="search-results">
                <div className="search-item">Searching…</div>
              </div>
            )}
          </div>

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
        </div>
      </div>

      <Footer />
    </>
  );
}
