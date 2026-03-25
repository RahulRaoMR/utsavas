"use client";

import styles from "./VendorPlansInfo.module.css";
import { LISTING_PLANS } from "../../lib/listingPlans";

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
        <p>
          Search priority on the user side follows the paid plan: Premium /
          Exclusive Listing halls appear first in matching city or PIN code
          results, followed by Featured Listing halls and then Basic Listing
          halls.
        </p>
      </div>
    </section>
  );
}
