"use client";

import styles from "./VendorPlansInfo.module.css";

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

export default function VendorPlansInfo({
  title = "Vendor listing plans",
  intro = "Review the listing plans and platform commission before continuing with UTSAVAS.",
}) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Vendor Pricing</p>
        <h2>{title}</h2>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.planGrid}>
        {LISTING_PLANS.map((plan) => (
          <article key={plan.name} className={styles.planCard}>
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
            {plan.note ? <p className={styles.planNote}>{plan.note}</p> : null}
          </article>
        ))}
      </div>

      <div className={styles.commissionBox}>
        <h3>Platform commission</h3>
        <p>
          If customer payment is completed through our platform, UTSAVAS
          collects a <strong>3% commission</strong> on the booking transaction
          value.
        </p>
      </div>
    </section>
  );
}
