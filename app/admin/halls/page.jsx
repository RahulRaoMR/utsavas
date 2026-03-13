"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";
import {
  getVenueCategoryLabel,
  getVenueRoute,
} from "../../../lib/venueCategories";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

function AdminHallsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingHallId, setDeletingHallId] = useState(null);

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

  const getViewRoute = (hall) => {
    return `${getVenueRoute(hall.category)}/${hall._id}`;
  };

  const deleteHall = async (id) => {
    if (!confirm("Delete this hall everywhere? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingHallId(id);
      const res = await fetch(`${API}/api/admin/halls/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to delete hall");
        return;
      }

      setHalls((prev) => prev.filter((hall) => hall._id !== id));
      alert("Hall deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete hall");
    } finally {
      setDeletingHallId(null);
    }
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
          <div className={styles.adminHallMedia}>
            <img
              src={
                hall.images?.[0]
                  ? toAbsoluteImageUrl(hall.images[0])
                  : "/dashboard/banquet.jpg"
              }
              alt={hall.hallName}
              className={styles.adminHallImage}
              onError={(e) => {
                e.currentTarget.src = "/dashboard/banquet.jpg";
              }}
            />
          </div>

          <div className={styles.adminHallBody}>
            <h3 className={styles.adminHallTitle}>{hall.hallName}</h3>

            <p>
              <b>Category:</b> {hall.category || "N/A"}
            </p>

            <p>
              <b>Venue Type:</b> {getVenueCategoryLabel(hall.category) || "N/A"}
            </p>

            <p>
              <b>Capacity:</b> {hall.capacity || 0}
            </p>

            <p>
              <b>City:</b> {hall.address?.city || "N/A"}
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

            <div className={styles.adminHallActions}>
              <button
                className={styles.viewButton}
                onClick={() => router.push(getViewRoute(hall))}
              >
                View
              </button>

              <button
                className={styles.button}
                onClick={() => router.push(`/admin/halls/${hall._id}/edit`)}
              >
                Edit
              </button>

              <button
                className={styles.deleteButton}
                onClick={() => deleteHall(hall._id)}
                disabled={deletingHallId === hall._id}
              >
                {deletingHallId === hall._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

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

export default function AdminHallsPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>Loading halls...</p>}>
      <AdminHallsContent />
    </Suspense>
  );
}
