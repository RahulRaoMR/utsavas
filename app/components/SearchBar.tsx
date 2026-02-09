"use client";

import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const router = useRouter();

  const handleSearch = () => {
    // 👉 redirect to dashboard page
    router.push("/dashboard");
  };

  return (
    <div className={styles.searchBar}>
      {/* CITY */}
      <select className={styles.input}>
        <option value="">City</option>
        <option>Bangalore</option>
        <option>Kochi</option>
        <option>Chennai</option>
      </select>

      {/* LOCATION */}
      <select className={styles.input}>
        <option value="">Select Location</option>

        {/* Central & East Bangalore */}
        <option>Indiranagar</option>
        <option>Whitefield</option>
        <option>MG Road</option>
        <option>Ulsoor</option>
        <option>Marathahalli</option>
        <option>KR Puram</option>

        {/* South Bangalore */}
        <option>Jayanagar</option>
        <option>JP Nagar</option>
        <option>Banashankari</option>
        <option>BTM Layout</option>
        <option>Electronic City</option>
        <option>Bannerghatta Road</option>

        {/* North Bangalore */}
        <option>Hebbal</option>
        <option>Yelahanka</option>
        <option>Devanahalli</option>
        <option>Jakkur</option>

        {/* West Bangalore */}
        <option>Rajajinagar</option>
        <option>Malleswaram</option>
        <option>Vijayanagar</option>
        <option>Yeshwanthpur</option>

        {/* Popular Event Areas */}
        <option>Sarjapur Road</option>
        <option>Hennur Road</option>
        <option>Kanakapura Road</option>
        <option>Mysore Road</option>
        <option>Tumkur Road</option>
      </select>

      {/* VENUE TYPE */}
      <select className={styles.input}>
        <option value="">Venue Type</option>
        <option>Wedding Hall</option>
        <option>Banquet Hall</option>
        <option>Outdoor Lawn</option>
      </select>

      {/* BUTTON */}
      <button className={styles.button} onClick={handleSearch}>
        Find Venues →
      </button>
    </div>
  );
}
