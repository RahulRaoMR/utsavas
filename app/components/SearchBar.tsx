"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./SearchBar.module.css";

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
    const params = new URLSearchParams(filters).toString();

    // 🚀 redirect to venues page with filters
    router.push(`/wedding-halls?${params}`);
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
        <option value="Bangalore">Bangalore</option>
      </select>

      {/* LOCATION */}
      <select
        name="location"
        className={styles.input}
        value={filters.location}
        onChange={handleChange}
      >
        <option value="">Select Location</option>
        <option value="Indiranagar">Indiranagar</option>
        <option value="Whitefield">Whitefield</option>
        <option value="MG Road">MG Road</option>
        <option value="Ulsoor">Ulsoor</option>
        <option value="Marathahalli">Marathahalli</option>
        <option value="KR Puram">KR Puram</option>
        <option value="Jayanagar">Jayanagar</option>
        <option value="JP Nagar">JP Nagar</option>
        <option value="Banashankari">Banashankari</option>
        <option value="BTM Layout">BTM Layout</option>
        <option value="Electronic City">Electronic City</option>
        <option value="Bannerghatta Road">Bannerghatta Road</option>
        <option value="Hebbal">Hebbal</option>
        <option value="Yelahanka">Yelahanka</option>
        <option value="Devanahalli">Devanahalli</option>
        <option value="Rajajinagar">Rajajinagar</option>
        <option value="Malleswaram">Malleswaram</option>
        <option value="Sarjapur Road">Sarjapur Road</option>
      </select>

      {/* VENUE TYPE */}
      <select
        name="type"
        className={styles.input}
        value={filters.type}
        onChange={handleChange}
      >
        <option value="">Venue Type</option>
        <option value="Wedding Hall">Wedding Hall</option>
        <option value="Banquet Hall">Banquet Hall</option>
        <option value="Outdoor Lawn">Outdoor Lawn</option>
      </select>

      {/* BUTTON */}
      <button className={styles.button} onClick={handleSearch}>
        Find Venues →
      </button>
    </div>
  );
}
