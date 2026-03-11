"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../admin.module.css";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

export default function AdminHallsPage() {
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const statusFilter = (searchParams.get("status") || "pending").toLowerCase();

  const fetchHalls = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/halls?status=${statusFilter}`, {
        cache: "no-store",
      });
      const data = await res.json();

      setHalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load halls");
      setHalls([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchHalls();

    const intervalId = window.setInterval(fetchHalls, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchHalls();
    };

    window.addEventListener("focus", fetchHalls);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchHalls);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchHalls]);

  const approveHall = async (id) => {
    if (!confirm("Approve this hall?")) return;

    await fetch(`${API}/api/admin/halls/${id}/approve`, {
      method: "PUT",
    });

    fetchHalls();
  };

  const rejectHall = async (id) => {
    if (!confirm("Reject this hall?")) return;

    await fetch(`${API}/api/admin/halls/${id}/reject`, {
      method: "PUT",
    });

    fetchHalls();
  };

  if (loading) {
    return <p className={styles.loading}>Loading halls...</p>;
  }

  const pageTitle =
    statusFilter === "all"
      ? "All Halls"
      : statusFilter === "approved"
        ? "Approved Halls"
        : statusFilter === "rejected"
          ? "Rejected Halls"
          : "Pending Halls";

  const searchedHalls = halls.filter((hall) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      hall.hallName,
      hall.category,
      hall.vendor?.businessName,
      hall.vendor?.email,
      hall.address?.city,
      hall.address?.area,
    ].some((value) => (value || "").toLowerCase().includes(query));
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{pageTitle}</h1>
      <div className={styles.pageToolbar}>
        <p className={styles.liveMeta}>Live count: {searchedHalls.length}</p>

        <div className={styles.searchShell}>
          <span className={styles.searchBadge}>Search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            placeholder="Search halls by hall name, vendor, city or category"
          />
        </div>
      </div>

      {searchedHalls.length === 0 && <p>No halls found</p>}

      {searchedHalls.map((hall) => (
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
            {hall.status === "approved" ? (
              <span className={styles.statusApproved}>APPROVED</span>
            ) : hall.status === "rejected" ? (
              <span className={styles.statusRejected}>REJECTED</span>
            ) : (
              <span className={styles.statusPending}>PENDING</span>
            )}
          </p>

          <p>
            <b>Vendor:</b> {hall.vendor?.businessName || "N/A"}
          </p>

          <p>
            <b>Email:</b> {hall.vendor?.email || "N/A"}
          </p>

          {hall.images?.length > 0 && (
            <div className={styles.hallImageRow}>
              {hall.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Hall"
                  width={120}
                  height={80}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #6b1d2b",
                  }}
                />
              ))}
            </div>
          )}

          {hall.status === "pending" && (
            <div className={styles.actionRow}>
              <button
                className={styles.button}
                onClick={() => approveHall(hall._id)}
              >
                Approve
              </button>

              <button
                className={styles.rejectButton}
                onClick={() => rejectHall(hall._id)}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
