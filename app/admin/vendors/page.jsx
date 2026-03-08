"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW PREMIUM STATES
  const [deleteVendorId, setDeleteVendorId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* =====================
     FETCH ALL VENDORS
  ===================== */
  const fetchVendors = async () => {
    try {
      const res = await fetch("https://utsavas-backend-1.onrender.com/api/vendor/all");

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
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* =====================
     APPROVE / REJECT VENDOR
  ===================== */
  const updateStatus = async (id, status) => {
    const confirmAction = confirm(
      `Are you sure you want to ${status.toUpperCase()} this vendor?`
    );
    if (!confirmAction) return;

    try {
      const res = await fetch(
        `https://utsavas-backend-1.onrender.com/api/vendor/status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to update vendor status");
    }
  };

  /* =====================
     ⭐ PREMIUM DELETE (CASCADE)
  ===================== */
  const confirmDeleteVendor = async () => {
    if (!deleteVendorId) return;

    try {
      setIsDeleting(true);

      const res = await fetch(
        `https://utsavas-backend-1.onrender.com/api/admin/vendors/${deleteVendorId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // refresh list
      fetchVendors();

      // close modal
      setDeleteVendorId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete vendor");
    } finally {
      setIsDeleting(false);
    }
  };

  /* =====================
     LOADING STATE
  ===================== */
  if (loading) {
    return <p className={styles.loading}>Loading vendors...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>👥 Vendor Approvals</h1>

      {vendors.length === 0 && <p>No vendors found</p>}

      {vendors.map((vendor) => (
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

          {/* APPROVE / REJECT */}
          {vendor.status === "pending" && (
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                className={styles.button}
                onClick={() => updateStatus(vendor._id, "approved")}
              >
                ✅ Approve
              </button>

              <button
                className={styles.rejectButton}
                onClick={() => updateStatus(vendor._id, "rejected")}
              >
                ❌ Reject
              </button>
            </div>
          )}

          {/* ⭐ PREMIUM DELETE */}
          <div style={{ marginTop: 10 }}>
            <button
              className={styles.deleteButton}
              onClick={() => setDeleteVendorId(vendor._id)}
            >
              🗑 Delete Vendor
            </button>
          </div>
        </div>
      ))}

      {/* 🔥 PREMIUM DELETE MODAL */}
      {deleteVendorId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Vendor?</h3>

            <p style={{ marginBottom: 16 }}>
              This will permanently remove:
              <br />• Vendor
              <br />• All halls
              <br />• All bookings
            </p>

            <div style={{ display: "flex", gap: 10 }}>
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
