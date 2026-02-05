"use client";

import { useEffect, useState } from "react";
import styles from "./halls.module.css";
import Link from "next/link";

export default function PublicHallsPage() {
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/halls/all")
      .then((res) => res.json())
      .then((data) => {
        // ONLY approved halls
        const approvedHalls = data.filter((h) => h.isApproved);
        setHalls(approvedHalls);
      })
      .catch((err) => {
        console.error("Failed to load halls", err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Wedding & Event Halls</h1>
      <p className={styles.subtitle}>
        Discover perfect venues for your special moments
      </p>

      <div className={styles.grid}>
        {halls.map((hall) => {
          // 🔍 DEBUG: check image path in browser console
          console.log("Hall image:", hall.image, hall.images);

          // ✅ support both image & images[]
          const imagePath =
            hall.image ||
            (Array.isArray(hall.images) ? hall.images[0] : null);

          return (
            <div key={hall._id} className={styles.card}>
              {/* ✅ IMAGE */}
              {imagePath ? (
                <img
                  src={`http://localhost:5000/${imagePath}`}
                  alt={hall.hallName}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  No Image Available
                </div>
              )}

              <h3>{hall.hallName}</h3>
              <p className={styles.location}>{hall.location}</p>

              <p className={styles.capacity}>
                Capacity: {hall.capacity || "N/A"}
              </p>

              <Link href={`/halls/${hall._id}`}>
                <button className={styles.button}>View Details</button>
              </Link>
            </div>
          );
        })}

        {halls.length === 0 && (
          <p>No halls available right now.</p>
        )}
      </div>
    </div>
  );
}
