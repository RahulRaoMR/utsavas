"use client";

import "./weddingHalls.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import FiltersSidebar from "../../components/FiltersSidebar";

export default function WeddingHallsPage() {
  const router = useRouter();

  const [halls, setHalls] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ PRICE RANGE STATE
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 500000,
  });

  /* =========================
     LOAD LOCATION + FETCH HALLS
  ========================= */
  useEffect(() => {
    const loc = localStorage.getItem("utsavasLocation");
    if (loc) setSelectedLocation(loc);

    fetchHalls();

    const handleStorageChange = () => {
      setSelectedLocation(localStorage.getItem("utsavasLocation"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* =========================
     FETCH APPROVED WEDDING HALLS
  ========================= */
  const fetchHalls = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/halls/public?category=wedding"
      );
      const data = await res.json();

      setHalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wedding halls", err);
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOCATION CHECK
  ========================= */
  const isLocationSelected =
    selectedLocation && selectedLocation !== "Select Location";

  /* =========================
     🔥 FINAL FILTER (FIXED PRICE)
  ========================= */
  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      // ✅ location filter
      let locationMatch = true;

      if (isLocationSelected) {
        const city = hall.address?.city?.toLowerCase() || "";
        const area = hall.address?.area?.toLowerCase() || "";

        locationMatch =
          city.includes(selectedLocation.toLowerCase()) ||
          area.includes(selectedLocation.toLowerCase());
      }

      // ✅🔥 CORRECT PRICE LOGIC
      const hallPrice =
        hall.pricePerEvent ||
        hall.pricePerDay ||
        hall.pricePerPlate ||
        0;

      const priceMatch =
        hallPrice >= priceRange.min &&
        hallPrice <= priceRange.max;

      return locationMatch && priceMatch;
    });
  }, [halls, selectedLocation, priceRange, isLocationSelected]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="wedding-page">
      <h1 className="page-title">
        Wedding Halls
        {isLocationSelected && (
          <span style={{ fontSize: "16px", color: "#777" }}>
            {" "}in {selectedLocation}
          </span>
        )}
      </h1>

      {loading && <p style={{ color: "#777" }}>Loading halls...</p>}

      <div className="wedding-layout">

        {/* LEFT FILTER */}
        <FiltersSidebar
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        {/* RIGHT HALLS */}
        <div className="hall-card-grid">
          {!loading && filteredHalls.length === 0 && (
            <p style={{ color: "#777" }}>
              No wedding halls found.
            </p>
          )}

          {filteredHalls.map((hall) => {
            // ✅🔥 UNIFIED DISPLAY PRICE
            const displayPrice =
              hall.pricePerEvent ||
              hall.pricePerDay ||
              hall.pricePerPlate ||
              0;

            const priceLabel =
              hall.pricePerEvent
                ? "per event"
                : hall.pricePerDay
                ? "per day"
                : hall.pricePerPlate
                ? "per plate"
                : "";

            return (
              <div
                key={hall._id}
                className="hall-card"
                onClick={() =>
                  router.push(`/wedding-halls/${hall._id}`)
                }
              >
                <img
                  src={
                    hall.images?.[0]
                      ? `http://localhost:5000${hall.images[0]}`
                      : "/hall1.jpg"
                  }
                  alt={hall.hallName}
                  loading="lazy"
                />

                <div className="hall-content">
                  <h3>{hall.hallName}</h3>

                  <p className="location">
                    📍 {hall.address?.area}, {hall.address?.city}
                  </p>

                  <div className="hall-meta">
                    <span>👥 {hall.capacity || 0} Capacity</span>
                    <span>🚗 {hall.parkingCapacity || 0} Parking</span>
                  </div>

                  {/* ✅🔥 FIXED PRICE DISPLAY */}
                  <p className="hall-price">
                    ₹{displayPrice.toLocaleString()}{" "}
                    {priceLabel}
                  </p>

                  <button className="hall-btn">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}