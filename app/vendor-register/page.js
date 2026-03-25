"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./vendorRegister.module.css";
import { karnatakaDistricts } from "../components/karnatakaDistricts";
import { karnatakaTaluksAndTowns } from "../components/karnatakaTaluksAndTowns";
import { bengaluruPincodes } from "../components/bengaluruPincodes";
import { VENUE_TYPE_OPTIONS } from "../../lib/venueCategories";
import VendorPlansInfo from "../components/VendorPlansInfo";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const LOCAL_LOCATION_LIBRARY = [
  ...karnatakaDistricts.map((place) => ({
    label: place,
    sublabel: "District, Karnataka",
    value: place,
    searchValue: place,
  })),
  ...karnatakaTaluksAndTowns.map((place) => ({
    label: place,
    sublabel: "Karnataka, India",
    value: place,
    searchValue: place,
  })),
  ...bengaluruPincodes.map((place) => ({
    label: place.area,
    sublabel: `Bengaluru, Karnataka - ${place.pincode}`,
    value: place.area,
    searchValue: `${place.area} ${place.pincode}`,
  })),
];

function mergeLocationSuggestions(...groups) {
  const seen = new Set();

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

function buildLocalLocationMatches(query) {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const startsWithMatches = [];
  const containsMatches = [];

  LOCAL_LOCATION_LIBRARY.forEach((item) => {
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

export default function VendorRegisterPage() {
  const router = useRouter();
  const cityFieldRef = useRef(null);

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    serviceType: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityError, setCityError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityFieldRef.current &&
        !cityFieldRef.current.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = form.city.trim();

    if (query.length < 2) {
      setCitySuggestions([]);
      setCityError("");
      return;
    }

    const controller = new AbortController();
    const localMatches = buildLocalLocationMatches(query);
    setCitySuggestions(localMatches);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location-suggestions?q=${encodeURIComponent(query)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const data = await res.json();
        const postalMatches = Array.isArray(data) ? data : [];

        setCitySuggestions(
          mergeLocationSuggestions(postalMatches, localMatches).slice(0, 10)
        );
        setCityError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Vendor city search failed:", error);
          setCitySuggestions(localMatches);
          setCityError(
            localMatches.length === 0
              ? "Unable to load places right now."
              : ""
          );
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.city]);

  const handleCityInputChange = (e) => {
    const value = e.target.value;

    setForm((currentForm) => ({
      ...currentForm,
      city: value,
    }));
    setCityError("");
    setShowCitySuggestions(value.trim().length >= 2);
  };

  const handlePickCity = (suggestion) => {
    setForm((currentForm) => ({
      ...currentForm,
      city: suggestion.label,
    }));
    setCityError("");
    setShowCitySuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/vendor/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      router.push("/vendor/vendor-login");
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <VendorPlansInfo
          title="Vendor listing plans"
          intro="Choose the right listing plan for your venue. These plans and the platform commission stay visible here so vendors can review them before registration."
        />

        <div className={styles.card}>
          <Link href="/" className={styles.logoLink} aria-label="Go to home page">
            <Image
              src="/logo/utsavaa-gold.png"
              alt="UTSAVAS"
              width={100}
              height={100}
              className={styles.logo}
            />
          </Link>

          <h1 className={styles.title}>Register as Vendor</h1>
          <p className={styles.subtitle}>
            Partner with UTSAVAS and grow your business
          </p>

          <form onSubmit={handleSubmit}>
            <input
              name="businessName"
              placeholder="Business Name"
              className={styles.input}
              value={form.businessName}
              onChange={handleChange}
              required
            />

            <input
              name="ownerName"
              placeholder="Owner Name"
              className={styles.input}
              value={form.ownerName}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              className={styles.input}
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className={styles.locationField} ref={cityFieldRef}>
              <input
                name="city"
                type="text"
                placeholder="City or PIN code"
                className={styles.input}
                value={form.city}
                onChange={handleCityInputChange}
                onFocus={() =>
                  setShowCitySuggestions(form.city.trim().length >= 2)
                }
                autoComplete="off"
                required
              />

              {showCitySuggestions && (
                <div className={styles.locationSuggestions}>
                  {cityError ? (
                    <div className={styles.locationFeedback}>{cityError}</div>
                  ) : null}

                  {citySuggestions.length > 0 ? (
                    citySuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.label}-${suggestion.sublabel || ""}`}
                        type="button"
                        className={styles.locationSuggestionItem}
                        onClick={() => handlePickCity(suggestion)}
                      >
                        <span className={styles.locationSuggestionCopy}>
                          <strong>{suggestion.label}</strong>
                          {suggestion.sublabel ? (
                            <small>{suggestion.sublabel}</small>
                          ) : null}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className={styles.locationFeedback}>
                      No destinations found. Try a nearby city, area, or PIN
                      code.
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              type="password"
              name="password"
              placeholder="Password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />

            <select
              name="serviceType"
              className={styles.input}
              value={form.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select Service Type</option>
              {VENUE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="service">Service Provider</option>
            </select>

            <button className={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>

          <p
            className={styles.backText}
            onClick={() => router.push("/vendor/vendor-login")}
          >
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
}
