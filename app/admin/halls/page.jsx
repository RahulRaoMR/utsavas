"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

export default function AdminHallsPage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================
     FETCH PENDING HALLS (ADMIN)
  ===================== */
  const fetchHalls = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/halls");
      const data = await res.json();

      setHalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load halls");
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  /* =====================
     APPROVE HALL
  ===================== */
  const approveHall = async (id) => {
    if (!confirm("Approve this hall?")) return;

    await fetch(
      `http://localhost:5000/api/admin/halls/${id}/approve`,
      { method: "PUT" }
    );

    // remove approved hall from list
    setHalls((prev) => prev.filter((h) => h._id !== id));
  };

  /* =====================
     REJECT HALL
  ===================== */
  const rejectHall = async (id) => {
    if (!confirm("Reject this hall?")) return;

    await fetch(
      `http://localhost:5000/api/admin/halls/${id}/reject`,
      { method: "PUT" }
    );

    // remove rejected hall from list
    setHalls((prev) => prev.filter((h) => h._id !== id));
  };

  if (loading) {
    return <p className={styles.loading}>Loading halls...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>
        🛠 Admin – Hall Approvals (UTSAVAM)
      </h1>

      {halls.length === 0 && <p>No halls found</p>}

      {halls.map((hall) => (
        <div key={hall._id} className={styles.hallCard}>
          <h3>{hall.hallName}</h3>

          <p>
            <b>Category:</b> {hall.category || "N/A"}
          </p>

          <p>
            <b>Capacity:</b> {hall.capacity || 0}
          </p>

          <p>
            <b>Status:</b>{" "}
            <span className={styles.statusPending}>PENDING</span>
          </p>

          <p>
            <b>Vendor:</b> {hall.vendor?.businessName || "N/A"}
          </p>

          <p>
            <b>Email:</b> {hall.vendor?.email || "N/A"}
          </p>

          {/* IMAGES */}
          {hall.images?.length > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {hall.images.map((img, i) => (
                <img
                  key={i}
                  src={img}   // ✅ image already has full URL
                  alt="Hall"
                  width={120}
                  height={80}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #6b1d2b", // UTSAVAM theme
                  }}
                />
              ))}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
            <button
              className={styles.button}
              onClick={() => approveHall(hall._id)}
            >
              ✅ Approve
            </button>

            <button
              className={styles.button}
              onClick={() => rejectHall(hall._id)}
              style={{ background: "#b71c1c" }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
