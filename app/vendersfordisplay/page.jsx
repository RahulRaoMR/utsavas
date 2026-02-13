"use client";

import { useEffect, useState } from "react";
import styles from "./vendorsdisplay.module.css";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Our Trusted Vendors</h1>
      <p className={styles.subtitle}>
        Handpicked partners for your perfect Utsavam
      </p>

      {loading ? (
        <p className={styles.loading}>Loading vendors...</p>
      ) : (
        <div className={styles.list}>
          {vendors.map((vendor) => (
            <div key={vendor._id} className={styles.card}>
              {vendor.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
