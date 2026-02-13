"use client";

import { useEffect, useState } from "react";
import styles from "./VenueSearch.module.css";

export default function VenueSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/halls/search?q=${query}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce like Google

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Search venues"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />

      {results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((hall) => (
            <div
              key={hall._id}
              className={styles.item}
              onClick={() => {
                window.location.href = `/halls/${hall._id}`;
              }}
            >
              🔍 {hall.name}
            </div>
          ))}
        </div>
      )}

      {loading && <div className={styles.loading}>Searching…</div>}
    </div>
  );
}
