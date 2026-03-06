"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./hallDetails.module.css";

export default function HallDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://utsavas-backend-1.onrender.com/api/halls/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHall(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading hall details...</p>;
  if (!hall) return <p>Hall not found</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🏛 {hall.hallName}</h1>

      <div className={styles.card}>
        {/* IMAGE */}
        {hall.images?.length > 0 && (
          <img
            src={`https://utsavas-backend-1.onrender.com${hall.images[0]}`}
            className={styles.image}
            alt={hall.hallName}
          />
        )}

        {/* BASIC INFO */}
        <p className={styles.text}><b>Category:</b> {hall.category}</p>
        <p className={styles.text}><b>Capacity:</b> {hall.capacity}</p>
        <p className={styles.text}><b>Rooms:</b> {hall.rooms}</p>
        <p className={styles.text}><b>Parking:</b> {hall.parkingCapacity}</p>

        {/* ADDRESS */}
        <h3 className={styles.sectionTitle}>📍 Address</h3>
        <p className={styles.text}>
          {hall.address?.flat}, {hall.address?.area}, {hall.address?.city}
        </p>
        <p className={styles.text}>
          {hall.address?.state} – {hall.address?.pincode}
        </p>

        {/* ABOUT */}
        <h3 className={styles.sectionTitle}>ℹ About</h3>
        <p className={styles.text}>{hall.about}</p>

        {/* FEATURES */}
        <h3 className={styles.sectionTitle}>✨ Features</h3>
        <div className={styles.features}>
          {Object.entries(hall.features || {}).map(
            ([key, value]) =>
              value && (
                <span key={key} className={styles.text}>
                  ✅ {key.replace(/([A-Z])/g, " $1")}
                </span>
              )
          )}
        </div>

        {/* STATUS */}
        <p className={styles.approved}>✅ Approved Venue</p>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Back
          </button>

          <button
            className={styles.editBtn}
            onClick={() => router.push(`/vendor/edit-hall/${hall._id}`)}
          >
            ✏ Edit Hall
          </button>
        </div>
      </div>
    </div>
  );
}
