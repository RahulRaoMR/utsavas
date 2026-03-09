"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./topnavbar.css";

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

export default function TopNavBar() {
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [user, setUser] = useState<UserLike | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [location, setLocation] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] =
    useState<boolean>(false);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);

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
    const loadUser = async () => {
      try {
        const savedLocation = localStorage.getItem("utsavasLocation");
        if (savedLocation) setLocation(savedLocation);

        const userStr = localStorage.getItem("user");
        const vendorStr = localStorage.getItem("vendor");
        const token = localStorage.getItem("token");

        let storedUser: UserLike | null = null;

        if (userStr) {
          storedUser = JSON.parse(userStr);
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
          if (!res.ok) return;

          const data = await res.json();
          if (data?.success && data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("User parse error:", err);
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
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&countrycodes=in&q=" +
          encodeURIComponent(`${query}, Karnataka, India`);

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        const formatted = list
          .map((item) => {
            const address = item?.address || {};
            const name =
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              address.county ||
              "";
            const district = address.county || "";
            if (!name) return "";
            return district && district !== name ? `${name}, ${district}` : name;
          })
          .filter(Boolean);

        const unique = [...new Set(formatted)].slice(0, 10);
        setLocationSuggestions(unique as string[]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Location search failed:", err);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");

    setUser(null);

    router.push("/");
  };

  const handleLocationSearch = () => {
    if (!location.trim()) return;

    const picked = location.trim();
    localStorage.setItem("utsavasLocation", picked);
    setShowLocationSuggestions(false);
    router.push(`/dashboard?city=${encodeURIComponent(picked)}`);
  };

  const handlePickSuggestion = (value: string) => {
    setLocation(value);
    localStorage.setItem("utsavasLocation", value);
    setShowLocationSuggestions(false);
    router.push(`/dashboard?city=${encodeURIComponent(value)}`);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setDetectingLocation(true);

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
            alert("Could not detect location");
            return;
          }

          setLocation(liveLocation);
          localStorage.setItem("utsavasLocation", liveLocation);
          setShowLocationSuggestions(false);
          router.push(`/dashboard?city=${encodeURIComponent(liveLocation)}`);
        } catch (err) {
          console.error("Live location fetch failed:", err);
          alert("Failed to detect live location");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        alert("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    user?.ownerName ||
    user?.businessName ||
    "Guest";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <nav className={`top-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <Link href="/">
            <img src="/utsavas-logo.png" alt="UTSAVAS" />
          </Link>
        </div>

        <div className="location-search-wrap" ref={locationRef}>
          <div className="location-bar">
            <button
              type="button"
              className="detect-location-btn"
              onClick={handleDetectLocation}
              title="Use my current location"
              aria-label="Use my current location"
            >
              {detectingLocation ? "..." : "📍"}
            </button>

            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
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

          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="location-suggestions">
              {locationSuggestions.map((place) => (
                <button
                  type="button"
                  key={place}
                  className="location-suggestion-item"
                  onClick={() => handlePickSuggestion(place)}
                >
                  {place}
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="nav-links">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/dashboard">Venues</Link>
          </li>
          <li>
            <Link href="/services">Services</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>

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

            <button onClick={handleLogout} className="mobile-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
