"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./vendorRegister.module.css";
import { useRouter } from "next/navigation";
import { karnatakaDistricts } from "../components/karnatakaDistricts";
import { VENUE_TYPE_OPTIONS } from "../../lib/venueCategories";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const LISTING_PLANS = [
  {
    name: "Basic Listing",
    badge: "Entry Plan",
    price: "Rs 1,000",
    bestFor: "Small halls, new properties",
    validity: "Valid for 3 months",
    features: [
      "1 property listing",
      "Photos upload",
      "Contact number visible",
      "Appears in normal search",
      "Direct customer contact",
    ],
    note: "Goal: Bring maximum properties onto platform",
  },
  {
    name: "Featured Listing",
    badge: "Standard Plan",
    price: "Rs 3,999 per property / year",
    bestFor: "Medium banquet halls, resorts, farms",
    validity: "Validity - 1 year",
    features: [
      "Featured in top search results",
      "Highlighted listing badge",
      "WhatsApp enquiry button",
      "10 lead credits",
      "Social media promotion (1 post)",
      "Analytics (views, enquiries)",
    ],
  },
  {
    name: "Premium / Exclusive Listing",
    badge: "Pro Plan",
    price: "Rs 9,999 per property / year",
    bestFor: "Premium wedding venues, resorts, convention halls",
    validity: "Validity - 1 year",
    features: [
      "Top placement on homepage",
      "Professional photoshoot (optional add-on)",
      "Unlimited leads",
      "Dedicated relationship manager",
      "Google Ads promotion",
      "Instagram promotion",
      "Featured tag + verified badge",
      "Priority customer support",
    ],
  },
];

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
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [registeredVendorName, setRegisteredVendorName] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/vendor/register`, {
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

      setRegisteredVendorName(form.businessName || form.ownerName || "Vendor");
      setShowPricingPopup(true);
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
          src="/logo/utsavaa-gold.png"
          alt="UTSAVAS"
          width={100}
          height={100}
          className={styles.logo}
        />

        <h1 className={styles.title}>Register as Vendor</h1>
        <p className={styles.subtitle}>
          Partner with UTSAVAS and grow your business
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

          <select
            name="city"
            className={styles.input}
            value={form.city}
            onChange={handleChange}
            required
          >
            <option value="">City</option>
            {karnatakaDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

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
            {VENUE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
          Back to Login
        </p>
      </div>

      {showPricingPopup && (
        <div
          className={styles.overlay}
          onClick={() => setShowPricingPopup(false)}
        >
          <div
            className={styles.pricingModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.pricingHeader}>
              <p className={styles.successTag}>Registration submitted</p>
              <h2>Vendor listing plans for {registeredVendorName}</h2>
              <p className={styles.pricingIntro}>
                Your vendor application has been received. Please review the
                listing plans and platform commission below before continuing.
              </p>
            </div>

            <div className={styles.planGrid}>
              {LISTING_PLANS.map((plan) => (
                <section key={plan.name} className={styles.planCard}>
                  <div className={styles.planTopRow}>
                    <span className={styles.planBadge}>{plan.badge}</span>
                    <strong className={styles.planPrice}>{plan.price}</strong>
                  </div>

                  <h3 className={styles.planTitle}>{plan.name}</h3>
                  <p className={styles.planBestFor}>
                    <span>Best for:</span> {plan.bestFor}
                  </p>

                  <ul className={styles.planList}>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <p className={styles.planValidity}>{plan.validity}</p>
                  {plan.note ? (
                    <p className={styles.planNote}>{plan.note}</p>
                  ) : null}
                </section>
              ))}
            </div>

            <div className={styles.commissionBox}>
              <h3>Platform commission</h3>
              <p>
                If customer payment is completed through our platform, UTSAVAS
                collects a <strong>3% commission</strong> on the booking
                transaction value.
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setShowPricingPopup(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => router.push("/vendor/vendor-login")}
              >
                Continue to Vendor Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
