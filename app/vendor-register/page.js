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

const IDENTITY_PROOF_OPTIONS = [
  { value: "aadhaar-card", label: "Aadhaar Card" },
  { value: "passport", label: "Passport" },
  { value: "driving-license", label: "Driving License" },
];

const ADDRESS_PROOF_OPTIONS = [
  { value: "electricity-bill", label: "Electricity Bill" },
  { value: "rental-agreement", label: "Rental Agreement" },
  { value: "shop-license", label: "Shop License" },
];

const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

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
    gstNumber: "",
    panNumber: "",
    identityProofType: "",
    addressProofType: "",
  });
  const [documentFiles, setDocumentFiles] = useState({
    gstCertificate: null,
    panCardDocument: null,
    identityProofDocument: null,
    addressProofDocument: null,
  });

  const [loading, setLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityError, setCityError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue =
      name === "gstNumber" || name === "panNumber"
        ? value.toUpperCase()
        : value;

    setForm({ ...form, [name]: normalizedValue });
  };

  const handleFileChange = (name, file) => {
    setDocumentFiles((currentFiles) => ({
      ...currentFiles,
      [name]: file || null,
    }));
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

    if (!form.serviceType) {
      alert("Please select the vendor service type");
      return;
    }

    if (!GSTIN_PATTERN.test(form.gstNumber.trim())) {
      alert("Please enter a valid GSTIN");
      return;
    }

    if (!PAN_PATTERN.test(form.panNumber.trim())) {
      alert("Please enter a valid PAN number");
      return;
    }

    if (
      !documentFiles.gstCertificate ||
      !documentFiles.panCardDocument ||
      !documentFiles.identityProofDocument ||
      !documentFiles.addressProofDocument
    ) {
      alert("Please upload all mandatory legal documents");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });

      Object.entries(documentFiles).forEach(([key, file]) => {
        if (file) {
          payload.append(key, file);
        }
      });

      const res = await fetch(`${API}/api/vendor/register`, {
        method: "POST",
        body: payload,
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

          <form onSubmit={handleSubmit} encType="multipart/form-data">
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

            {form.serviceType ? (
              <section className={styles.documentSection}>
                <div className={styles.documentHeader}>
                  <h2 className={styles.documentTitle}>Legal documents for approval</h2>
                  <p className={styles.documentCopy}>
                    Upload the required business and identity documents so the
                    UTSAVAS team can verify and approve the vendor account.
                  </p>
                </div>

                <input
                  name="gstNumber"
                  placeholder="GST Number (GSTIN)"
                  className={styles.input}
                  value={form.gstNumber}
                  onChange={handleChange}
                  required
                />

                <label className={styles.fileField}>
                  <span className={styles.fileLabel}>
                    GST Certificate (PDF/Image)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className={styles.fileInput}
                    onChange={(e) =>
                      handleFileChange(
                        "gstCertificate",
                        e.target.files?.[0] || null
                      )
                    }
                    required
                  />
                  <small className={styles.fileName}>
                    {documentFiles.gstCertificate?.name ||
                      "Upload GST certificate"}
                  </small>
                </label>

                <input
                  name="panNumber"
                  placeholder="PAN Number"
                  className={styles.input}
                  value={form.panNumber}
                  onChange={handleChange}
                  required
                />

                <label className={styles.fileField}>
                  <span className={styles.fileLabel}>
                    PAN Card (PDF/Image)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className={styles.fileInput}
                    onChange={(e) =>
                      handleFileChange(
                        "panCardDocument",
                        e.target.files?.[0] || null
                      )
                    }
                    required
                  />
                  <small className={styles.fileName}>
                    {documentFiles.panCardDocument?.name ||
                      "Upload PAN card copy"}
                  </small>
                </label>

                <select
                  name="identityProofType"
                  className={styles.input}
                  value={form.identityProofType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Identity Proof</option>
                  {IDENTITY_PROOF_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className={styles.fileField}>
                  <span className={styles.fileLabel}>
                    Identity Proof File (PDF/Image)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className={styles.fileInput}
                    onChange={(e) =>
                      handleFileChange(
                        "identityProofDocument",
                        e.target.files?.[0] || null
                      )
                    }
                    required
                  />
                  <small className={styles.fileName}>
                    {documentFiles.identityProofDocument?.name ||
                      "Upload identity proof"}
                  </small>
                </label>

                <select
                  name="addressProofType"
                  className={styles.input}
                  value={form.addressProofType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Address Proof</option>
                  {ADDRESS_PROOF_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className={styles.fileField}>
                  <span className={styles.fileLabel}>
                    Address Proof File (PDF/Image)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className={styles.fileInput}
                    onChange={(e) =>
                      handleFileChange(
                        "addressProofDocument",
                        e.target.files?.[0] || null
                      )
                    }
                    required
                  />
                  <small className={styles.fileName}>
                    {documentFiles.addressProofDocument?.name ||
                      "Upload address proof"}
                  </small>
                </label>
              </section>
            ) : (
              <div className={styles.documentPrompt}>
                Select the service type to continue with the mandatory GST,
                PAN, identity proof, and address proof upload.
              </div>
            )}

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
