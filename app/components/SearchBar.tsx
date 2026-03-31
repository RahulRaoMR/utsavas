"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./SearchBar.module.css";
import { karnatakaSearchCities } from "./karnatakaSearchCities";
import { DEFAULT_VENUE_ROUTE, VENUE_TYPE_OPTIONS } from "../../lib/venueCategories";

export default function SearchBar() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    city: "",
    location: "",
    type: "",
  });

  const availableLocations = useMemo(() => {
    const selectedCity = karnatakaSearchCities.find(
      (option) => option.value === filters.city
    );

    return selectedCity?.locations || [];
  }, [filters.city]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      if (name === "city") {
        return {
          ...prev,
          city: value,
          location: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
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
            {karnatakaSearchCities.map((cityOption) => (
              <option key={cityOption.value} value={cityOption.value}>
                {cityOption.label}
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
            disabled={!filters.city}
          >
            <option value="">
              {filters.city ? "Select Nearby Location" : "Select City First"}
            </option>
            {availableLocations.map((place) => (
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
