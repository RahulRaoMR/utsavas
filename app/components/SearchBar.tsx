"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./SearchBar.module.css";
import { karnatakaDistricts } from "./karnatakaDistricts";
import { karnatakaTaluksAndTowns } from "./karnatakaTaluksAndTowns";
import { DEFAULT_VENUE_ROUTE, VENUE_TYPE_OPTIONS } from "../../lib/venueCategories";

export default function SearchBar() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    city: "",
    location: "",
    type: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = () => {
    const city = filters.city.trim();
    const location = filters.location.trim();
    const type = filters.type.trim();

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (location) params.set("location", location);

    const selectedVenueType = VENUE_TYPE_OPTIONS.find((option) => option.value === type);
    const route = selectedVenueType?.route || DEFAULT_VENUE_ROUTE;
    if (type) params.set("category", type);
    const query = params.toString();
    router.push(query ? `${route}?${query}` : route);
  };

  return (
    <div className={styles.searchShell}>
      <div className={styles.searchIntro}>
        <span className={styles.searchTag}>Search UTSAVAS</span>
        <h2>Find your next venue</h2>
        <p>Browse wedding halls, banquet halls, and party venues across Karnataka.</p>
      </div>

      <div className={styles.searchBar}>
        <label className={styles.field}>
          <span className={styles.fieldIcon} aria-hidden="true">LOC</span>
          <select
            name="city"
            className={styles.input}
            value={filters.city}
            onChange={handleChange}
          >
            <option value="">City</option>
            {karnatakaDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldIcon} aria-hidden="true">ARE</span>
          <select
            name="location"
            className={styles.input}
            value={filters.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            {karnatakaTaluksAndTowns.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldIcon} aria-hidden="true">TYP</span>
          <select
            name="type"
            className={styles.input}
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">Venue Type</option>
            {VENUE_TYPE_OPTIONS.map((option) => (
              <option key={option.value || "default"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button className={styles.button} onClick={handleSearch}>
          Find Venues
        </button>
      </div>
    </div>
  );
}
