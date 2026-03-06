"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./myHalls.module.css";

export default function MyHallsPage() {
  const router = useRouter();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const vendorData = localStorage.getItem("vendor");
      const vendor = vendorData ? JSON.parse(vendorData) : null;

      if (!vendor?._id) {
        router.replace("/vendor/vendor-login");
        return;
      }

      fetch(`https://utsavas-backend-1.onrender.com/api/halls/vendor/${vendor._id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Vendor halls API:", data);

          // ✅🔥 CRITICAL FIX — read data.data
          setHalls(Array.isArray(data?.data) ? data.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch halls error:", err);
          setLoading(false);
        });
    } catch (err) {
      console.error("Vendor parse error:", err);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <p className={styles.loading}>Loading your halls...</p>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🏛 My Approved Halls</h1>

      {halls.length === 0 && (
        <p className={styles.empty}>
          No approved halls yet. Please wait for admin approval.
        </p>
      )}

      <div className={styles.grid}>
        {halls.map((hall) => (
          <div key={hall._id} className={styles.card}>
            {hall.images?.[0] && (
              <img
                src={`https://utsavas-backend-1.onrender.com${hall.images[0]}`}
                alt={hall.hallName}
                className={styles.image}
              />
            )}

            <div className={styles.cardBody}>
              <h3 className={styles.hallName}>{hall.hallName}</h3>

              <p><b>Category:</b> {hall.category}</p>
              <p><b>Capacity:</b> {hall.capacity}</p>
              <p><b>City:</b> {hall.address?.city}</p>

              <p className={styles.approved}>✅ Approved</p>

              {/* ACTION BUTTONS */}
              <div className={styles.actions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => router.push(`/hall/${hall._id}`)}
                >
                  👁 View
                </button>

                <button
                  className={styles.editBtn}
                  onClick={() => router.push(`/vendor/edit-hall/${hall._id}`)}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}