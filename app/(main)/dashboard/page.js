"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./dashboard.css";
import EnquiryPopup from "../../components/EnquiryPopup";
import Footer from "../../components/Footer";
import { getApiBaseUrl } from "../../../lib/api";
import { trackHallView } from "../../../lib/hallAnalytics";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";
import {
  DEFAULT_VENUE_ROUTE,
  getVenueCategoryCards,
  getVenueCategoryLabel,
  getVenueRoute,
} from "../../../lib/venueCategories";

function toLocalDayKey(value) {
  const parsedDate = new Date(value);

  if (!Number.isFinite(parsedDate.getTime())) {
    return "";
  }

  return `${parsedDate.getFullYear()}-${parsedDate.getMonth()}-${parsedDate.getDate()}`;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef(null);
  const activeSearchLocation =
    (searchParams.get("city") || searchParams.get("location") || "").trim();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [onboardingAds, setOnboardingAds] = useState([]);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [loadingOnboardingAds, setLoadingOnboardingAds] = useState(true);
  const categoryCards = getVenueCategoryCards();

  useEffect(() => {
    const filled = localStorage.getItem("enquiryFilled");
    if (!filled) {
      setShowPopup(true);
    }

    const savedLocation = localStorage.getItem("utsavasSearchedLocation") || "";
    const nextLocation = activeSearchLocation || savedLocation;

    if (nextLocation) {
      localStorage.setItem("utsavasSearchedLocation", nextLocation);
    }
  }, [activeSearchLocation]);

  const openCategoryListing = (route, title, categoryKey) => {
    const params = new URLSearchParams();

    if (title) {
      params.set("title", title);
    }

    if (categoryKey) {
      params.set("category", categoryKey);
    }

    if (activeSearchLocation) {
      params.set("location", activeSearchLocation);
    }

    const queryString = params.toString();
    router.push(queryString ? `${route}?${queryString}` : route);
  };

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);

      try {
        const query = search.trim();
        const response = await fetch(
          `${getApiBaseUrl()}/api/halls/search?q=${encodeURIComponent(query)}`
        );
        const payload = await response.json();
        const halls = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        const normalizedQuery = query.toLowerCase();
        const filtered = halls.filter((hall) => {
          const hallName = hall?.hallName?.toLowerCase?.() || "";
          const area = hall?.address?.area?.toLowerCase?.() || "";
          const city = hall?.address?.city?.toLowerCase?.() || "";
          const pincode = hall?.address?.pincode?.toLowerCase?.() || "";
          const category = hall?.category?.toLowerCase?.() || "";

          return (
            hallName.includes(normalizedQuery) ||
            area.includes(normalizedQuery) ||
            city.includes(normalizedQuery) ||
            pincode.includes(normalizedQuery) ||
            category.includes(normalizedQuery)
          );
        });

        setResults(filtered);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    let isCancelled = false;

    const fetchOnboardingAds = async () => {
      setLoadingOnboardingAds(true);

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/halls/public`, {
          cache: "no-store",
        });
        const payload = await response.json();
        const halls = Array.isArray(payload) ? payload : [];
        const sortedHalls = halls
          .filter((hall) => hall?._id)
          .sort(
            (left, right) =>
              new Date(right?.createdAt || 0).getTime() -
              new Date(left?.createdAt || 0).getTime()
          );

        const todayKey = toLocalDayKey(new Date());
        const todaysHalls = sortedHalls.filter(
          (hall) => toLocalDayKey(hall?.createdAt) === todayKey
        );
        const shortlistedAds = (todaysHalls.length > 0 ? todaysHalls : sortedHalls).slice(
          0,
          8
        );

        if (isCancelled) {
          return;
        }

        setOnboardingAds(shortlistedAds);
        setActiveAdIndex(0);
      } catch (error) {
        console.error("Failed to load onboarding ads", error);

        if (!isCancelled) {
          setOnboardingAds([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingOnboardingAds(false);
        }
      }
    };

    fetchOnboardingAds();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (onboardingAds.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveAdIndex((currentIndex) =>
        currentIndex >= onboardingAds.length - 1 ? 0 : currentIndex + 1
      );
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [onboardingAds]);

  const openHall = (hall) => {
    setResults([]);
    void (async () => {
      await trackHallView(hall._id);
      router.push(`${getVenueRoute(hall.category)}/${hall._id}`);
    })();
  };

  const handleSearchSubmit = () => {
    const query = search.trim();
    if (!query) {
      return;
    }

    const exactMatch = results.find(
      (hall) => (hall?.hallName || "").toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      openHall(exactMatch);
      return;
    }

    const preferredCategory = results[0]?.category || "";
    const listingRoute = getVenueRoute(preferredCategory) || DEFAULT_VENUE_ROUTE;
    const params = new URLSearchParams({ q: query });

    if (preferredCategory) {
      params.set("category", preferredCategory);
    }

    if (activeSearchLocation) {
      params.set("city", activeSearchLocation);
    }

    setResults([]);
    router.push(`${listingRoute}?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOnboardingAd = onboardingAds[activeAdIndex] || null;
  const activeAdIsToday =
    activeOnboardingAd &&
    toLocalDayKey(activeOnboardingAd.createdAt) === toLocalDayKey(new Date());
  const onboardingImage =
    activeOnboardingAd?.images?.[0]
      ? toAbsoluteImageUrl(activeOnboardingAd.images[0])
      : "";
  const onboardingLocation = [
    activeOnboardingAd?.address?.area,
    activeOnboardingAd?.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const moveOnboardingAd = (direction) => {
    if (onboardingAds.length === 0) {
      return;
    }

    setActiveAdIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) {
        return onboardingAds.length - 1;
      }

      if (nextIndex >= onboardingAds.length) {
        return 0;
      }

      return nextIndex;
    });
  };

  return (
    <>
      {showPopup ? <EnquiryPopup onClose={() => setShowPopup(false)} /> : null}

      <div className="dashboard-container">
        <div className="overlay">
          <h1 className="title">
            <span className="titleLead">Welcome to</span>
            <span className="titleBrand">UTSAVAS</span>
          </h1>
          <p className="subtitle">Where UTSAVAS Become Memories</p>

          {loadingOnboardingAds || activeOnboardingAd ? (
            <section className="onboarding-strip" aria-label="Onboarding Today">
              <div className="onboarding-header">
                <div>
                  <span className="onboarding-tag">Onboarding Today</span>
                  <h2>Venue Ads</h2>
                </div>

                {onboardingAds.length > 1 ? (
                  <div className="onboarding-controls">
                    <button
                      type="button"
                      className="onboarding-arrow"
                      onClick={() => moveOnboardingAd(-1)}
                      aria-label="Show previous onboarding ad"
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      className="onboarding-arrow"
                      onClick={() => moveOnboardingAd(1)}
                      aria-label="Show next onboarding ad"
                    >
                      {">"}
                    </button>
                  </div>
                ) : null}
              </div>

              {loadingOnboardingAds && !activeOnboardingAd ? (
                <div className="onboarding-loading">
                  Loading the latest registered venues...
                </div>
              ) : activeOnboardingAd ? (
                <>
                  <article className="onboarding-card">
                    <div
                      className="onboarding-image"
                      style={
                        onboardingImage
                          ? { backgroundImage: `url("${onboardingImage}")` }
                          : undefined
                      }
                    >
                      {!onboardingImage ? (
                        <span className="onboarding-image-fallback">UTSAVAS</span>
                      ) : null}
                    </div>

                    <div className="onboarding-content">
                      <div className="onboarding-badges">
                        <span className="onboarding-status">
                          {activeAdIsToday ? "New Today" : "Fresh Listing"}
                        </span>
                        <span className="onboarding-category">
                          {getVenueCategoryLabel(activeOnboardingAd.category) || "Venue"}
                        </span>
                      </div>

                      <h3>{activeOnboardingAd.hallName || "Registered venue"}</h3>
                      <p className="onboarding-location">
                        {onboardingLocation || "Location details coming soon"}
                      </p>
                      <p className="onboarding-copy">
                        {activeOnboardingAd?.capacity
                          ? `Up to ${activeOnboardingAd.capacity} guests`
                          : "Venue details available now"}
                      </p>

                      <button
                        type="button"
                        className="onboarding-cta"
                        onClick={() => openHall(activeOnboardingAd)}
                      >
                        View Venue
                      </button>
                    </div>
                  </article>

                  {onboardingAds.length > 1 ? (
                    <div className="onboarding-dots">
                      {onboardingAds.map((ad, index) => (
                        <button
                          type="button"
                          key={ad._id}
                          className={`onboarding-dot ${
                            index === activeAdIndex ? "active" : ""
                          }`}
                          aria-label={`Show onboarding ad ${index + 1}`}
                          onClick={() => setActiveAdIndex(index)}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}

          <div className="search-wrapper" ref={searchRef}>
            <span className="search-icon">{"\uD83D\uDD0D"}</span>

            <input
              type="text"
              placeholder="Search venues"
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" ? handleSearchSubmit() : null
              }
            />

            <button className="search-btn" onClick={handleSearchSubmit}>
              Search
            </button>

            {results.length > 0 ? (
              <div className="search-results">
                {results.slice(0, 6).map((hall) => (
                  <div
                    key={hall._id}
                    className="search-item"
                    onClick={() => openHall(hall)}
                  >
                    <strong>{hall.hallName}</strong>
                    <p>
                      {hall.address?.area}, {hall.address?.city}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {loading ? (
              <div className="search-results">
                <div className="search-item">Searching...</div>
              </div>
            ) : null}
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
    <Suspense
      fallback={
        <div className="dashboard-container">
          <div className="overlay" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
