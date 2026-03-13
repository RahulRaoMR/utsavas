"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./myHalls.module.css";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";
import { getVenueCategoryLabel } from "../../../lib/venueCategories";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function MyHallsPage() {
  const router = useRouter();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingHallId, setDeletingHallId] = useState(null);

  useEffect(() => {
    try {
      const vendorData = localStorage.getItem("vendor");
      const vendor = vendorData ? JSON.parse(vendorData) : null;
      const vendorId = vendor?._id || vendor?.id;

      if (!vendorId) {
        router.replace("/vendor/vendor-login");
        return;
      }

      fetch(`${API}/api/halls/vendor/${vendorId}`)
        .then((res) => res.json())
        .then((data) => {
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

  const handleDeleteHall = async (hallId) => {
    try {
      const vendorData = localStorage.getItem("vendor");
      const vendor = vendorData ? JSON.parse(vendorData) : null;
      const vendorId = vendor?._id || vendor?.id;

      if (!vendorId) {
        alert("Vendor session expired. Please login again.");
        router.replace("/vendor/vendor-login");
        return;
      }

      const confirmDelete = confirm("Are you sure you want to delete this hall?");
      if (!confirmDelete) return;

      setDeletingHallId(hallId);

      let res = await fetch(
        `${API}/api/halls/${hallId}?vendorId=${vendorId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        res = await fetch(`${API}/api/halls/delete/${hallId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId }),
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to delete hall");
        return;
      }

      setHalls((prev) => prev.filter((h) => h._id !== hallId));
      alert("Hall deleted successfully");
    } catch (error) {
      console.error("Delete hall error:", error);
      alert("Failed to delete hall");
    } finally {
      setDeletingHallId(null);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading your halls...</p>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Approved Halls</h1>

      {halls.length === 0 && (
        <p className={styles.empty}>
          No approved halls yet. Please wait for admin approval.
        </p>
      )}

      <div className={styles.grid}>
        {halls.map((hall) => (
          <div key={hall._id} className={styles.card}>
            <img
              src={
                hall.images?.[0]
                  ? toAbsoluteImageUrl(hall.images[0])
                  : "/dashboard/banquet.jpg"
              }
              alt={hall.hallName}
              className={styles.image}
              onError={(e) => {
                e.currentTarget.src = "/dashboard/banquet.jpg";
              }}
            />

            <div className={styles.cardBody}>
              <h3 className={styles.hallName}>{hall.hallName}</h3>

              <p><b>Category:</b> {getVenueCategoryLabel(hall.category) || hall.category}</p>
              <p><b>Capacity:</b> {hall.capacity}</p>
              <p><b>City:</b> {hall.address?.city}</p>

              <p className={styles.approved}>Approved</p>

              <div className={styles.actions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => router.push(`/vendor/hall/${hall._id}`)}
                >
                  View
                </button>

                <button
                  className={styles.editBtn}
                  onClick={() => router.push(`/vendor/hall/${hall._id}/edit`)}
                >
                  Edit
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteHall(hall._id)}
                  disabled={deletingHallId === hall._id}
                >
                  {deletingHallId === hall._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
