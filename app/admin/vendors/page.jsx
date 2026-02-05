"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================
     FETCH ALL VENDORS
  ===================== */
  const fetchVendors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vendor/all");

      if (!res.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load admin data", err);
      alert("Failed to load admin data");
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
    if (!confirm(`Are you sure you want to ${status} this vendor?`)) return;

    try {
      await fetch(`http://localhost:5000/api/vendor/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      fetchVendors(); // refresh list
    } catch (err) {
      alert("Failed to update vendor status");
    }
  };

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
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

          {/* ACTION BUTTONS */}
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
        </div>
      ))}
    </div>
  );
}
