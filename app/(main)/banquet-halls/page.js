"use client";

import "../wedding-halls/weddingHalls.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import FiltersSidebar from "../../components/FiltersSidebar";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";

export default function BanquetHallsPage() {
  const router = useRouter();

  const [halls, setHalls] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ PRICE RANGE (same as wedding)
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 500000,
  });

  /* =====================
     LOAD LOCATION + HALLS
  ===================== */
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

  /* =====================
     FETCH BANQUET HALLS
  ===================== */
  const fetchHalls = async () => {
    try {
      const res = await fetch(
        "https://utsavas-backend-1.onrender.com/api/halls/public?category=banquet"
      );

      const data = await res.json();
      setHalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch banquet halls", err);
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     LOCATION CHECK
  ===================== */
  const isLocationSelected =
    selectedLocation && selectedLocation !== "Select Location";

  /* =====================
     🔥 FINAL FILTER (MATCHED)
  ===================== */
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

      // ✅ price logic (same as wedding)
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

  /* =====================
     UI
  ===================== */
  return (
    <div className="wedding-page">
      <h1 className="page-title">
        Banquet Halls
        {isLocationSelected && (
          <span style={{ fontSize: "16px", color: "#777" }}>
            {" "}in {selectedLocation}
          </span>
        )}
      </h1>

      {loading && <p style={{ color: "#777" }}>Loading halls...</p>}

      <div className="wedding-layout">
        {/* ✅ LEFT FILTER (ADDED) */}
        <FiltersSidebar
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        {/* ✅ RIGHT GRID */}
        <div className="hall-card-grid">
          {!loading && filteredHalls.length === 0 && (
            <p style={{ color: "#777" }}>
              No banquet halls found.
            </p>
          )}

          {filteredHalls.map((hall) => {
            // ✅ unified price display
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
                  router.push(`/banquet-halls/${hall._id}`)
                }
              >
                <img
                  src={
                    hall.images?.[0]
                      ? toAbsoluteImageUrl(hall.images[0])
                      : "/hall1.jpg"
                  }
                  alt={hall.hallName}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/hall1.jpg";
                  }}
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

                  {/* ✅ PRICE ADDED */}
                  <p className="hall-price">
                    ₹{displayPrice.toLocaleString()} {priceLabel}
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
