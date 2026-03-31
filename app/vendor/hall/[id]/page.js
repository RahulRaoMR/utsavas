"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./hallDetails.module.css";
import { getApiBaseUrl } from "../../../../lib/api";
import { toAbsoluteImageUrl } from "../../../../lib/imageUrl";
import { buildVenueMapUrls } from "../../../../lib/hallLocation";
import { getVenueCategoryLabel } from "../../../../lib/venueCategories";
import {
  clearVendorSession,
  getVendorAuthHeaders,
  getVendorSession,
} from "../../../../lib/panelAuth";

const formatFeatureLabel = (key) =>
  String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

const formatNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue.toLocaleString("en-IN")
    : "Not listed";
};

const formatPrice = (hall) => {
  const pricePerEvent = Number(hall?.pricePerEvent || 0);
  const pricePerDay = Number(hall?.pricePerDay || 0);
  const pricePerPlate = Number(hall?.pricePerPlate || 0);

  if (pricePerEvent > 0) {
    return `Rs ${pricePerEvent.toLocaleString("en-IN")} per event`;
  }

  if (pricePerDay > 0) {
    return `Rs ${pricePerDay.toLocaleString("en-IN")} per day`;
  }

  if (pricePerPlate > 0) {
    return `Rs ${pricePerPlate.toLocaleString("en-IN")} per plate`;
  }

  return "Price on request";
};

const formatAddressLines = (address = {}) => {
  const lineOne = [address.flat, address.floor, address.area]
    .filter(Boolean)
    .join(", ");
  const lineTwo = [address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
  const landmark = address.landmark ? `Near ${address.landmark}` : "";

  return [lineOne, lineTwo, landmark].filter(Boolean);
};

const getStatusLabel = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (normalizedStatus === "approved") {
    return "Approved Venue";
  }

  if (normalizedStatus === "pending") {
    return "Pending Approval";
  }

  if (normalizedStatus === "rejected") {
    return "Rejected";
  }

  return "Draft";
};

export default function HallDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadHall = async () => {
      try {
        const session = getVendorSession();

        if (!session.vendor || !session.vendorId || !session.token) {
          clearVendorSession();
          router.replace("/vendor/vendor-login");
          return;
        }

        const response = await fetch(`${getApiBaseUrl()}/api/halls/${id}`, {
          cache: "no-store",
          headers: getVendorAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          clearVendorSession();
          router.replace("/vendor/vendor-login");
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load hall details");
        }

        if (isCancelled) {
          return;
        }

        setHall(data);
        setError("");
      } catch (fetchError) {
        if (isCancelled) {
          return;
        }

        console.error("Load hall details error:", fetchError);
        setHall(null);
        setError(fetchError.message || "Failed to load hall details");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadHall();

    return () => {
      isCancelled = true;
    };
  }, [id, router]);

  const activeFeatures = useMemo(
    () =>
      Object.entries(hall?.features || {}).filter(
        ([, value]) => value === true || value === "true" || value === 1
      ),
    [hall]
  );

  const addressLines = formatAddressLines(hall?.address);
  const imageUrl = hall?.images?.[0]
    ? toAbsoluteImageUrl(hall.images[0])
    : "/dashboard/banquet.jpg";
  const mapDetails = buildVenueMapUrls({
    hallName: hall?.hallName,
    address: hall?.address,
    location: hall?.location,
  });

  if (loading) {
    return <p className={styles.state}>Loading hall details...</p>;
  }

  if (!hall) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <h1 className={styles.stateTitle}>Hall not available</h1>
          <p className={styles.stateCopy}>{error || "This hall could not be loaded."}</p>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push("/vendor/my-halls")}
          >
            Back to My Halls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Vendor Hall Details</p>
          <h1 className={styles.title}>{hall.hallName || "Venue"}</h1>
          <p className={styles.subtitle}>
            Review your venue details, status, pricing, and amenities in one place.
          </p>
        </div>

        <span
          className={`${styles.statusBadge} ${
            String(hall.status || "").toLowerCase() === "approved"
              ? styles.statusApproved
              : String(hall.status || "").toLowerCase() === "pending"
              ? styles.statusPending
              : styles.statusRejected
          }`}
        >
          {getStatusLabel(hall.status)}
        </span>
      </div>

      <div className={styles.card}>
        <div className={styles.heroGrid}>
          <img
            src={imageUrl}
            className={styles.image}
            alt={hall.hallName || "Venue"}
            onError={(event) => {
              event.currentTarget.src = "/dashboard/banquet.jpg";
            }}
          />

          <div className={styles.summaryPanel}>
            <p className={styles.price}>{formatPrice(hall)}</p>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span>Category</span>
                <strong>{getVenueCategoryLabel(hall.category) || hall.category || "-"}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Capacity</span>
                <strong>{formatNumber(hall.capacity)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Rooms</span>
                <strong>{formatNumber(hall.rooms)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Parking</span>
                <strong>{formatNumber(hall.parkingCapacity)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Listing Plan</span>
                <strong>{hall.listingPlan || "Basic"}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Venue ID</span>
                <strong>{hall._id}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailGrid}>
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Address</h2>
            {addressLines.length > 0 ? (
              addressLines.map((line) => (
                <p key={line} className={styles.text}>
                  {line}
                </p>
              ))
            ) : (
              <p className={styles.muted}>Address details have not been added yet.</p>
            )}

            {mapDetails?.directionsUrl ? (
              <a
                href={mapDetails.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.linkButton}
              >
                Open Directions
              </a>
            ) : null}
          </section>

          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>About</h2>
            <p className={styles.text}>
              {hall.about || "No venue description has been added yet."}
            </p>
          </section>
        </div>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Features</h2>
          {activeFeatures.length > 0 ? (
            <div className={styles.features}>
              {activeFeatures.map(([key]) => (
                <span key={key} className={styles.featurePill}>
                  {formatFeatureLabel(key)}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>No features have been marked for this venue yet.</p>
          )}
        </section>

        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => router.push("/vendor/my-halls")}>
            Back
          </button>

          <button
            className={styles.editBtn}
            onClick={() => router.push(`/vendor/hall/${hall._id}/edit`)}
          >
            Edit Hall
          </button>
        </div>
      </div>
    </div>
  );
}
