"use client";

import "../wedding-halls/weddingHalls.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import FiltersSidebar from "../../components/FiltersSidebar";
import { getApiBaseUrl } from "../../../lib/api";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";
import {
  categoryBelongsToRoute,
  getVenueCategoryLabel,
  normalizeVenueCategory,
} from "../../../lib/venueCategories";

const normalize = (value) => String(value || "").trim().toLowerCase();

function PartyVenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 500000,
  });

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/halls/public`);
        const data = await res.json();
        setHalls(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch party venues", err);
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const queryText = normalize(searchParams.get("q"));
  const cityFilter = normalize(searchParams.get("city"));
  const areaFilter = normalize(searchParams.get("location"));
  const requestedCategoryParam = normalizeVenueCategory(searchParams.get("category"));
  const requestedCategory = normalizeVenueCategory(searchParams.get("category"));
  const requestedTitle =
    getVenueCategoryLabel(requestedCategory) ||
    searchParams.get("title") ||
    "Party Venues";
  const displayLocationLabel =
    searchParams.get("location") || searchParams.get("city") || "";
  const activeLocationFilter = areaFilter || cityFilter;

  const baseFilteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      let locationMatch = true;
      if (activeLocationFilter) {
        const city = normalize(hall.address?.city);
        const area = normalize(hall.address?.area);
        const pincode = normalize(hall.address?.pincode);
        locationMatch =
          city.includes(activeLocationFilter) ||
          area.includes(activeLocationFilter) ||
          pincode.includes(activeLocationFilter);
      }

      const hallPrice =
        hall.pricePerEvent || hall.pricePerDay || hall.pricePerPlate || 0;
      const priceMatch =
        hallPrice >= priceRange.min && hallPrice <= priceRange.max;

      const queryMatch =
        !queryText ||
        normalize(hall.hallName).includes(queryText) ||
        normalize(hall.address?.area).includes(queryText) ||
        normalize(hall.address?.city).includes(queryText) ||
        normalize(hall.address?.pincode).includes(queryText);

      return locationMatch && priceMatch && queryMatch;
    });
  }, [activeLocationFilter, halls, priceRange, queryText]);

  const routeMatchedHalls = useMemo(() => {
    const matches = baseFilteredHalls.filter((hall) => {
      const category = normalizeVenueCategory(hall.category);
      return categoryBelongsToRoute(category, "/party-venues");
    });

    if (matches.length === 0) {
      return baseFilteredHalls;
    }

    return matches;
  }, [baseFilteredHalls]);

  const exactCategoryHalls = useMemo(() => {
    if (!requestedCategoryParam) {
      return routeMatchedHalls;
    }
    const exactMatches = routeMatchedHalls.filter(
      (hall) => normalizeVenueCategory(hall.category) === requestedCategoryParam
    );

    return exactMatches;
  }, [requestedCategoryParam, routeMatchedHalls]);

  const filteredHalls = requestedCategoryParam ? exactCategoryHalls : routeMatchedHalls;

  return (
    <div className="wedding-page">
      <div className="page-hero">
        <div className="page-hero-head">
          <button
            type="button"
            className="page-link-back"
            onClick={() => router.push("/party-venues")}
          >
            All Party Venues
          </button>

          <button
            type="button"
            className="mobile-filter-trigger"
            onClick={() => setShowMobileFilters(true)}
          >
            <span className="mobile-filter-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span>Filters</span>
          </button>
        </div>
        <h1 className="page-title">{requestedTitle}</h1>
        <p className="page-subtitle">
          {displayLocationLabel
            ? `Showing registered ${requestedTitle} venues in ${displayLocationLabel}`
            : requestedCategoryParam
              ? `Showing all registered ${requestedTitle} venues`
              : "Showing all registered venues in this section"}
        </p>
      </div>

      {loading && <p style={{ color: "#777" }}>Loading halls...</p>}

      {showMobileFilters && (
        <div
          className="mobile-filter-overlay"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="mobile-filter-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <FiltersSidebar
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}

      <div className="wedding-layout">
        <div className="desktop-filters-wrap">
          <FiltersSidebar
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>

        <div className="hall-card-grid">
          {!loading && filteredHalls.length === 0 && (
            <p style={{ color: "#777" }}>
              {requestedCategoryParam
                ? `No registered ${requestedTitle} venues found.`
                : "No venues found for this selection."}
            </p>
          )}

          {filteredHalls.map((hall) => {
            const displayPrice =
              hall.pricePerEvent || hall.pricePerDay || hall.pricePerPlate || 0;

            const priceLabel = hall.pricePerEvent
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
                onClick={() => router.push(`/party-venues/${hall._id}`)}
              >
                <img
                  src={
                    hall.images?.[0]
                      ? toAbsoluteImageUrl(hall.images[0])
                      : "/dashboard/banquet.jpg"
                  }
                  alt={hall.hallName}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/dashboard/banquet.jpg";
                  }}
                />

                <div className="hall-content">
                  <h3>{hall.hallName}</h3>
                  <p className="location">
                    {"\uD83D\uDCCD"} {hall.address?.area}, {hall.address?.city}
                  </p>

                  <div className="hall-meta">
                    <span>{"\uD83D\uDC65"} {hall.capacity || 0} Capacity</span>
                    <span>{"\uD83D\uDE97"} {hall.parkingCapacity || 0} Parking</span>
                  </div>

                  <p className="hall-price">
                    {"\u20B9"}{displayPrice.toLocaleString()} {priceLabel}
                  </p>

                  <button className="hall-btn">View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PartyVenuesPage() {
  return (
    <Suspense fallback={<p style={{ padding: 20, color: "#777" }}>Loading halls...</p>}>
      <PartyVenuesContent />
    </Suspense>
  );
}
