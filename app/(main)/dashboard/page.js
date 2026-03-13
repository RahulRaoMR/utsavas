"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import "./dashboard.css";
import EnquiryPopup from "../../components/EnquiryPopup";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../../components/Footer";
import { getApiBaseUrl } from "../../../lib/api";
import {
  DEFAULT_VENUE_ROUTE,
  getVenueCategoryCards,
  getVenueRoute,
} from "../../../lib/venueCategories";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const categoryCards = getVenueCategoryCards();

  /* ===================================
     ✅ POPUP + LOCATION (PUBLIC — NO LOGIN)
  =================================== */
  useEffect(() => {
    const filled = localStorage.getItem("enquiryFilled");
    if (!filled) setShowPopup(true);

    const locationFromQuery =
      (searchParams.get("city") || searchParams.get("location") || "").trim();
    const savedLocation = localStorage.getItem("utsavasSearchedLocation") || "";
    const nextLocation = locationFromQuery || savedLocation;

    if (nextLocation) {
      setSelectedLocation(nextLocation);
      localStorage.setItem("utsavasSearchedLocation", nextLocation);
    } else {
      setSelectedLocation("");
    }
  }, [searchParams]);

  const openCategoryListing = (route, title, categoryKey) => {
    const params = new URLSearchParams();
    const pickedLocation = selectedLocation.trim();

    if (title) {
      params.set("title", title);
    }

    if (categoryKey) {
      params.set("category", categoryKey);
    }

    if (pickedLocation) {
      params.set("city", pickedLocation);
    }

    const queryString = params.toString();
    router.push(queryString ? `${route}?${queryString}` : route);
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
          `${getApiBaseUrl()}/api/halls/search?q=${encodeURIComponent(
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
    router.push(`${getVenueRoute(hall.category)}/${hall._id}`);
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

    const preferredCategory = results[0]?.category || "";
    const listingRoute = getVenueRoute(preferredCategory) || DEFAULT_VENUE_ROUTE;
    const pickedLocation = selectedLocation.trim();

    setResults([]);
    const params = new URLSearchParams({ q: query });
    if (preferredCategory) {
      params.set("category", preferredCategory);
    }
    if (pickedLocation) {
      params.set("city", pickedLocation);
    }
    router.push(`${listingRoute}?${params.toString()}`);
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
            {categoryCards.map((category) => (
              <button
                key={category.key}
                type="button"
                className="category-tile"
                onClick={() =>
                  openCategoryListing(
                    getVenueRoute(category.key) ||
                      category.route ||
                      DEFAULT_VENUE_ROUTE,
                    category.title,
                    category.key
                  )
                }
              >
                <span
                  className="category-thumb"
                  style={{ backgroundImage: `url("${category.image}")` }}
                ></span>
                <span className="category-content">
                  <span className="category-label">{category.title}</span>
                  <span className="category-meta">{category.meta}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard-container"><div className="overlay" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
