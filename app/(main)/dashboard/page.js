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
     ✅ POPUP + LOCATION (PUBLIC — NO LOGIN)
  =================================== */
  useEffect(() => {
    const filled = localStorage.getItem("enquiryFilled");
    if (!filled) setShowPopup(true);

    const savedLocation = localStorage.getItem("utsavasSearchedLocation");
    if (savedLocation) setSelectedLocation(savedLocation);
  }, []);

  const openCategoryListing = (route) => {
    const pickedLocation = (selectedLocation || "").trim();

    if (pickedLocation) {
      router.push(`${route}?city=${encodeURIComponent(pickedLocation)}`);
      return;
    }

    router.push(route);
  };

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
        const query = search.trim();
        const res = await fetch(
          `https://utsavas-backend-1.onrender.com/api/halls/search?q=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();
        const halls = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        const qLower = query.toLowerCase();
        const filtered = halls.filter((hall) => {
          const hallName = hall?.hallName?.toLowerCase?.() || "";
          const area = hall?.address?.area?.toLowerCase?.() || "";
          const city = hall?.address?.city?.toLowerCase?.() || "";
          const category = hall?.category?.toLowerCase?.() || "";

          return (
            hallName.includes(qLower) ||
            area.includes(qLower) ||
            city.includes(qLower) ||
            category.includes(qLower)
          );
        });

        setResults(filtered);
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
    const query = search.trim();
    if (!query) return;

    const exactMatch = results.find(
      (hall) =>
        (hall?.hallName || "").toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      openHall(exactMatch);
      return;
    }

    const preferredCategory =
      results[0]?.category === "banquet" || results[0]?.category === "party"
        ? results[0].category
        : "wedding";

    const listingRoute =
      preferredCategory === "banquet"
        ? "/banquet-halls"
        : preferredCategory === "party"
        ? "/party-venues"
        : "/wedding-halls";

    setResults([]);
    router.push(`${listingRoute}?q=${encodeURIComponent(query)}`);
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
          <h1 className="title">
            <span className="titleLead">Welcome to</span>
            <span className="titleBrand">UTSAVAS</span>
          </h1>
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
              onClick={() => openCategoryListing("/wedding-halls")}
            >
              Wedding Halls
            </div>

            <div
              className="card banquet"
              onClick={() => openCategoryListing("/banquet-halls")}
            >
              Banquet Halls
            </div>

            <div
              className="card party"
              onClick={() => openCategoryListing("/party-venues")}
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
