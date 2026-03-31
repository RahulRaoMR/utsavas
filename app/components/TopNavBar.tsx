"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./topnavbar.css";
import { getGeolocationErrorMessage } from "./geolocationError";
import { karnatakaDistricts } from "./karnatakaDistricts";
import { karnatakaTaluksAndTowns } from "./karnatakaTaluksAndTowns";
import { bengaluruPincodes } from "./bengaluruPincodes";
import { clearUserSession } from "../../lib/authRedirect";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

type UserLike = {
  firstName?: string;
  lastName?: string;
  name?: string;
  ownerName?: string;
  businessName?: string;
};

type LocationSuggestion = {
  label: string;
  sublabel?: string;
  value: string;
  searchValue?: string;
  source: "search" | "popular" | "recent" | "current" | "local" | "postal";
};

const normalizeText = (value: string) => String(value || "").trim().toLowerCase();

const KARNATAKA_LOCATION_LIBRARY: LocationSuggestion[] = [
  ...karnatakaDistricts.map((place) => ({
    label: place,
    sublabel: "District, Karnataka",
    value: place,
    searchValue: place,
    source: "local" as const,
  })),
  ...karnatakaTaluksAndTowns.map((place) => ({
    label: place,
    sublabel: "Karnataka, India",
    value: place,
    searchValue: place,
    source: "local" as const,
  })),
  ...bengaluruPincodes.map((place) => ({
    label: place.area,
    sublabel: `Bengaluru, Karnataka - ${place.pincode}`,
    value: place.area,
    searchValue: place.area,
    source: "local" as const,
  })),
];

function mergeLocationSuggestions(...groups: LocationSuggestion[][]) {
  const seen = new Set<string>();

  return groups.flat().filter((item) => {
    const key = `${normalizeText(item.label)}|${normalizeText(
      item.searchValue || item.value
    )}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildLocalLocationMatches(query: string) {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const startsWithMatches: LocationSuggestion[] = [];
  const containsMatches: LocationSuggestion[] = [];

  KARNATAKA_LOCATION_LIBRARY.forEach((item) => {
    const searchText = normalizeText(
      `${item.label} ${item.sublabel || ""} ${item.searchValue || item.value}`
    );

    if (searchText.startsWith(normalizedQuery)) {
      startsWithMatches.push(item);
      return;
    }

    if (searchText.includes(normalizedQuery)) {
      containsMatches.push(item);
    }
  });

  return mergeLocationSuggestions(startsWithMatches, containsMatches).slice(0, 8);
}

const POPULAR_DESTINATIONS: LocationSuggestion[] = [
  { label: "Bengaluru", sublabel: "Karnataka, India", value: "Bengaluru", source: "popular" },
  { label: "Mysuru", sublabel: "Karnataka, India", value: "Mysuru", source: "popular" },
  { label: "Mangaluru", sublabel: "Karnataka, India", value: "Mangaluru", source: "popular" },
  { label: "Hubballi", sublabel: "Karnataka, India", value: "Hubballi", source: "popular" },
];

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "HM" },
  { href: "/dashboard", label: "Venues", icon: "VN" },
  { href: "/services", label: "Services", icon: "SV" },
  { href: "/contact", label: "Contact Us", icon: "CT" },
];

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navRef = useRef<HTMLElement | null>(null);
  const navMainRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [user, setUser] = useState<UserLike | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [location, setLocation] = useState<string>("");
  const [recentLocation, setRecentLocation] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showLocationSuggestions, setShowLocationSuggestions] =
    useState<boolean>(false);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    const root = document.documentElement;

    const syncNavMetrics = () => {
      const navHeight = Math.ceil(navRef.current?.getBoundingClientRect().height || 0);
      const navMainHeight = Math.ceil(
        navMainRef.current?.getBoundingClientRect().height || 0
      );

      if (navHeight > 0) {
        root.style.setProperty("--top-nav-offset", `${navHeight}px`);
      }

      if (navMainHeight > 0) {
        root.style.setProperty("--top-nav-main-height", `${navMainHeight}px`);
      }
    };

    syncNavMetrics();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncNavMetrics())
        : null;

    if (navRef.current && resizeObserver) {
      resizeObserver.observe(navRef.current);
    }

    if (navMainRef.current && resizeObserver) {
      resizeObserver.observe(navMainRef.current);
    }

    window.addEventListener("resize", syncNavMetrics);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncNavMetrics);
    };
  }, [menuOpen, pathname, user]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedLocation = localStorage.getItem("utsavasLocation");
        if (savedLocation) setLocation(savedLocation);

        const savedRecentLocation = localStorage.getItem("utsavasRecentLocation");
        if (savedRecentLocation) setRecentLocation(savedRecentLocation);

        const userStr = localStorage.getItem("user");
        const vendorStr = localStorage.getItem("vendor");
        const token = localStorage.getItem("token");

        let storedUser: UserLike | null = null;

        if (userStr && token) {
          storedUser = JSON.parse(userStr);
        } else if (userStr && !token) {
          clearUserSession();
        } else if (vendorStr) {
          storedUser = JSON.parse(vendorStr);
        }

        if (storedUser) {
          setUser(storedUser);
          return;
        }

        if (token) {
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            clearUserSession();
            setUser(null);
            return;
          }

          const data = await res.json();
          if (data?.success && data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          } else {
            clearUserSession();
            setUser(null);
          }
        }
      } catch (err) {
        console.error("User parse error:", err);
        clearUserSession();
        setUser(null);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleLocationOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleLocationOutside);
    return () => document.removeEventListener("mousedown", handleLocationOutside);
  }, []);

  useEffect(() => {
    const query = location.trim();

    if (query.length < 2) {
      setLocationSuggestions([]);
      setLocationError("");
      return;
    }

    const controller = new AbortController();
    const localMatches = buildLocalLocationMatches(query);
    setLocationSuggestions(localMatches);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location-suggestions?q=${encodeURIComponent(query)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const data = await res.json();
        const postalMatches = Array.isArray(data) ? data : [];

        setLocationSuggestions(
          mergeLocationSuggestions(postalMatches, localMatches).slice(0, 10)
        );
        setLocationError("");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Location search failed:", err);
          setLocationSuggestions(localMatches);
          setLocationError(
            localMatches.length === 0
              ? "Unable to load destinations right now."
              : ""
          );
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");

    setUser(null);

    router.push("/");
  };

  const saveLocationAndGo = (searchValue: string, displayValue = searchValue) => {
    setLocation(displayValue);
    setRecentLocation(displayValue);
    localStorage.setItem("utsavasLocation", displayValue);
    localStorage.setItem("utsavasRecentLocation", displayValue);
    localStorage.setItem("utsavasSearchedLocation", searchValue);
    setShowLocationSuggestions(false);
    router.push(`/dashboard?location=${encodeURIComponent(searchValue)}`);
  };

  const handleLocationSearch = () => {
    const picked = location.trim();
    if (!picked) return;
    saveLocationAndGo(picked);
  };

  const handlePickSuggestion = (suggestion: LocationSuggestion) => {
    saveLocationAndGo(
      suggestion.searchValue || suggestion.value,
      suggestion.label
    );
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this device.");
      setShowLocationSuggestions(true);
      return;
    }

    if (!window.isSecureContext) {
      setLocationError(getGeolocationErrorMessage());
      setShowLocationSuggestions(true);
      return;
    }

    setDetectingLocation(true);
    setLocationError("");
    setShowLocationSuggestions(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const address = data?.address || {};

          const liveLocation =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            data?.display_name?.split(",")?.[0] ||
            "";

          if (!liveLocation) {
            setLocationError("Could not detect your current destination.");
            return;
          }

          saveLocationAndGo(liveLocation);
        } catch (err) {
          console.error("Live location fetch failed:", err);
          setLocationError("Failed to detect your destination from GPS.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        setLocationError(getGeolocationErrorMessage(error));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const dropdownSuggestions =
    location.trim().length >= 2
      ? locationSuggestions
      : [
          {
            label: "Use my current location",
            sublabel: detectingLocation
              ? "Detecting your destination..."
              : "Find venues near you",
            value: "__current__",
            source: "current" as const,
          },
          ...(recentLocation
            ? [
                {
                  label: recentLocation,
                  sublabel: "Recent search",
                  value: recentLocation,
                  source: "recent" as const,
                },
              ]
            : []),
          ...POPULAR_DESTINATIONS,
        ];

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    user?.ownerName ||
    user?.businessName ||
    "Guest";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <nav ref={navRef} className={`top-nav ${scrolled ? "scrolled" : ""}`}>
        <div ref={navMainRef} className="top-nav-main">
          <div className="brand-cluster">
            <div className="logo">
              <Link href="/">
                <img src="/logo/utsavaa-gold.png" alt="UTSAVAS" />
              </Link>
            </div>

            <div className="brand-copy">
              <strong>utsavas</strong>
              <span>Venue booking</span>
            </div>
          </div>

          <div className="location-search-wrap" ref={locationRef}>
            <div className="location-bar">
              <div className="search-field">
                <span className="search-field-icon" aria-hidden="true"></span>
                <input
                  type="text"
                  placeholder="Search place, area, or PIN code"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setLocationError("");
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                />
              </div>
            </div>

            {showLocationSuggestions && (
              <div className="location-suggestions">
                <div className="location-suggestions-header">
                  <span className="location-suggestions-title">
                    {location.trim().length >= 2
                      ? "Matching destinations"
                      : "Popular destinations"}
                  </span>
                  <button
                    type="button"
                    className="location-current-link"
                    onClick={handleDetectLocation}
                  >
                    Use current location
                  </button>
                </div>

                {locationError ? (
                  <div className="location-feedback">{locationError}</div>
                ) : null}

                {dropdownSuggestions.length > 0 ? (
                  dropdownSuggestions.map((place) => (
                    <button
                      type="button"
                      key={`${place.source}-${place.value}`}
                      className="location-suggestion-item"
                      onClick={() =>
                        place.value === "__current__"
                          ? handleDetectLocation()
                          : handlePickSuggestion(place)
                      }
                    >
                      <span className="location-suggestion-icon">
                        {place.source === "current"
                          ? "GPS"
                          : place.source === "recent"
                          ? "REC"
                          : place.source === "local"
                          ? "KTK"
                          : "PIN"}
                      </span>
                      <span className="location-suggestion-copy">
                        <strong>{place.label}</strong>
                        {place.sublabel ? <small>{place.sublabel}</small> : null}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="location-feedback">
                    No destinations found. Try a nearby city or area name.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="auth-section">
            {!user && (
              <>
                <Link href="/vendor/vendor-login" className="list-btn">
                  List your property
                </Link>

                <Link href="/register" className="register-btn">
                  Register
                </Link>

                <Link href="/login" className="signin-btn">
                  Sign in
                </Link>
              </>
            )}

            {user && (
              <div className="user-wrapper" ref={dropdownRef}>
                <div className="user-chip" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="avatar">{avatarLetter}</div>

                  <span className="user-name">{displayName}</span>
                </div>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>

                    <Link href="/my-bookings" onClick={() => setDropdownOpen(false)}>
                      My Bookings
                    </Link>

                    <Link href="/my-cart" onClick={() => setDropdownOpen(false)}>
                      My Cart
                    </Link>

                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            )}

            <button
              className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div className="top-nav-categories">
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={pathname === item.href ? "nav-link-active" : ""}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
          Venues
        </Link>
        <Link href="/services" onClick={() => setMenuOpen(false)}>
          Services
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </Link>

        {!user && (
          <>
            <Link
              href="/vendor/vendor-login"
              className="mobile-btn"
              onClick={() => setMenuOpen(false)}
            >
              List your property
            </Link>

            <Link
              href="/register"
              className="mobile-btn"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>

            <Link
              href="/login"
              className="mobile-btn"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
          </>
        )}

        {user && (
          <>
            <div className="mobile-user-badge">
              <span>{avatarLetter}</span>
              <strong>{displayName}</strong>
            </div>

            <Link href="/profile" onClick={() => setMenuOpen(false)}>
              My Profile
            </Link>

            <Link href="/my-bookings" onClick={() => setMenuOpen(false)}>
              My Bookings
            </Link>

            <Link href="/my-cart" onClick={() => setMenuOpen(false)}>
              My Cart
            </Link>

            <button onClick={handleLogout} className="mobile-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
