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
    if (!id) return;

    fetch(`http://localhost:5000/api/halls/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Hall not found");
        return res.json();
      })
      .then((data) => {
        setHall(data);
        setLoading(false);
      })
      .catch(() => {
        router.replace("/vendor/my-halls");
      });
  }, [id, router]);

  if (loading) {
    return <p className={styles.loading}>Loading hall details...</p>;
  }

  if (!hall) {
    return <p className={styles.loading}>Hall not found</p>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{hall.hallName}</h1>

      <div className={styles.card}>
        {/* Images */}
        {hall.images?.length > 0 && (
          <div className={styles.images}>
            {hall.images.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000${img}`}
                alt="Hall"
              />
            ))}
          </div>
        )}

        {/* Details */}
        <div className={styles.details}>
          <p><b>Category:</b> {hall.category}</p>
          <p><b>Capacity:</b> {hall.capacity}</p>
          <p><b>Parking Capacity:</b> {hall.parkingCapacity}</p>
          <p><b>Rooms:</b> {hall.rooms}</p>
          <p><b>City:</b> {hall.address?.city}</p>
          <p><b>About:</b> {hall.about}</p>

          <p className={styles.approved}>✅ Approved</p>
        </div>
      </div>
    </div>
  );
}
