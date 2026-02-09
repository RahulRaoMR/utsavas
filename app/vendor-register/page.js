"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./vendorRegister.module.css";
import { useRouter } from "next/navigation";

export default function VendorRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    serviceType: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ CALL NEXT.JS API (NOT EXPRESS)
      const res = await fetch("http://localhost:5000/api/vendor/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(form),
});


      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      alert("Vendor registration submitted for approval!");
      router.push("/vendor/vendor-login");
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Image
          src="/utsavas-logo.png"
          alt="UTSAVAS"
          width={100}
          height={100}
          className={styles.logo}
        />

        <h1 className={styles.title}>Register as Vendor</h1>
        <p className={styles.subtitle}>
          Partner with UTSAVAS & grow your business
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="businessName"
            placeholder="Business Name"
            className={styles.input}
            value={form.businessName}
            onChange={handleChange}
            required
          />

          <input
            name="ownerName"
            placeholder="Owner Name"
            className={styles.input}
            value={form.ownerName}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            className={styles.input}
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="city"
            placeholder="City"
            className={styles.input}
            value={form.city}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="serviceType"
            className={styles.input}
            value={form.serviceType}
            onChange={handleChange}
            required
          >
            <option value="">Select Service Type</option>
            <option value="wedding">Wedding Hall</option>
            <option value="banquet">Banquet Hall</option>
            <option value="party">Party Hall</option>
            <option value="service">Service Provider</option>
          </select>

          <button className={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>

        <p
          className={styles.backText}
          onClick={() => router.push("/vendor/vendor-login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}
