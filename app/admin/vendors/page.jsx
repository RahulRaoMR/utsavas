"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../admin.module.css";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminToken,
} from "../../../lib/panelAuth";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

function AdminVendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteVendorId, setDeleteVendorId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const statusFilter = (searchParams.get("status") || "all").toLowerCase();

  const fetchVendors = useCallback(async () => {
    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const res = await fetch(`${API}/api/vendor/all`, {
        cache: "no-store",
        headers: getAdminAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await res.json();
      const vendorList = Array.isArray(data?.vendors)
        ? data.vendors
        : Array.isArray(data)
          ? data
          : [];

      setVendors(vendorList);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendor data");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchVendors();

    const intervalId = window.setInterval(fetchVendors, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchVendors();
    };

    window.addEventListener("focus", fetchVendors);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchVendors);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchVendors]);

  const updateStatus = async (id, status) => {
    const confirmAction = confirm(
      `Are you sure you want to ${status.toUpperCase()} this vendor?`
    );
    if (!confirmAction) return;

    try {
      const adminToken = getAdminToken();

      if (!adminToken) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const res = await fetch(`${API}/api/vendor/status/${id}`, {
        method: "PUT",
        headers: getAdminAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ status }),
      });

      if (res.status === 401 || res.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to update vendor status");
    }
  };

  const confirmDeleteVendor = async () => {
    if (!deleteVendorId) return;

    try {
      setIsDeleting(true);
      const adminToken = getAdminToken();

      if (!adminToken) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const res = await fetch(
        `${API}/api/admin/vendors/${deleteVendorId}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );

      if (res.status === 401 || res.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      fetchVendors();
      setDeleteVendorId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete vendor");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading vendors...</p>;
  }

  const filteredVendors = vendors.filter((vendor) =>
    statusFilter === "all" ? true : vendor.status === statusFilter
  );

  const searchedVendors = filteredVendors.filter((vendor) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      vendor.businessName,
      vendor.ownerName,
      vendor.email,
      vendor.phone,
      vendor.city,
      vendor.serviceType,
    ].some((value) => (value || "").toLowerCase().includes(query));
  });

  const pageTitle =
    statusFilter === "pending"
      ? "Pending Vendors"
      : statusFilter === "approved"
        ? "Approved Vendors"
        : statusFilter === "rejected"
          ? "Rejected Vendors"
          : "All Vendors";

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{pageTitle}</h1>
      <div className={styles.pageToolbar}>
        <p className={styles.liveMeta}>Live count: {searchedVendors.length}</p>

        <div className={styles.searchShell}>
          <span className={styles.searchBadge}>Search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            placeholder="Search vendors by name, city, email or phone"
          />
        </div>
      </div>

      {searchedVendors.length === 0 && (
        <p>
          {statusFilter === "pending"
            ? "No pending vendors found in the current backend."
            : "No vendors found."}
        </p>
      )}

      {searchedVendors.map((vendor) => (
        <div key={vendor._id} className={styles.card}>
          <h3>{vendor.businessName}</h3>

          <p><b>Owner:</b> {vendor.ownerName}</p>
          <p><b>Email:</b> {vendor.email}</p>
          <p><b>Phone:</b> {vendor.phone}</p>
          <p><b>City:</b> {vendor.city}</p>
          <p><b>Service:</b> {vendor.serviceType}</p>

          <p>
            <b>Status:</b>{" "}
            {vendor.status === "approved" && (
              <span className={styles.statusApproved}>APPROVED</span>
            )}
            {vendor.status === "pending" && (
              <span className={styles.statusPending}>PENDING</span>
            )}
            {vendor.status === "rejected" && (
              <span className={styles.statusRejected}>REJECTED</span>
            )}
          </p>

          {vendor.status === "pending" && (
            <div className={styles.actionRow}>
              <button
                className={styles.button}
                onClick={() => updateStatus(vendor._id, "approved")}
              >
                Approve
              </button>

              <button
                className={styles.rejectButton}
                onClick={() => updateStatus(vendor._id, "rejected")}
              >
                Reject
              </button>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              className={styles.deleteButton}
              onClick={() => setDeleteVendorId(vendor._id)}
            >
              Delete Vendor
            </button>
          </div>
        </div>
      ))}

      {deleteVendorId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Vendor?</h3>

            <p style={{ marginBottom: 16 }}>
              This will permanently remove:
              <br />- Vendor
              <br />- All halls
              <br />- All bookings
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.closeBtn}
                onClick={() => setDeleteVendorId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                className={styles.deleteBtn}
                onClick={confirmDeleteVendor}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>Loading vendors...</p>}>
      <AdminVendorsContent />
    </Suspense>
  );
}
