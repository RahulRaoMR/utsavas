"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./SearchBar.module.css";
import { karnatakaDistricts } from "./karnatakaDistricts";
import { karnatakaTaluksAndTowns } from "./karnatakaTaluksAndTowns";

export default function SearchBar() {
  const router = useRouter();

  // ✅ filter state
  const [filters, setFilters] = useState({
    city: "",
    location: "",
    type: "",
  });

  // ✅ handle dropdown change
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ handle search (NO LOGIN REQUIRED)
  const handleSearch = () => {
    const city = filters.city.trim();
    const location = filters.location.trim();
    const type = filters.type.trim();

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (location) params.set("location", location);

    const routeByType: Record<string, string> = {
      wedding: "/wedding-halls",
      banquet: "/banquet-halls",
      party: "/party-venues",
    };

    const route = routeByType[type] || "/wedding-halls";
    const query = params.toString();
    router.push(query ? `${route}?${query}` : route);
  };

  return (
    <div className={styles.searchBar}>
      {/* CITY */}
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

      {/* LOCATION */}
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

      {/* VENUE TYPE */}
      <select
        name="type"
        className={styles.input}
        value={filters.type}
        onChange={handleChange}
      >
        <option value="">Venue Type</option>
        <option value="wedding">Wedding Hall</option>
        <option value="banquet">Banquet Hall</option>
        <option value="party">Party Venue</option>
      </select>

      {/* BUTTON */}
      <button className={styles.button} onClick={handleSearch}>
        Find Venues →
      </button>
    </div>
  );
}
