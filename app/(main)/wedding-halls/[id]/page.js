"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./hallDetail.css";

export default function HallDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  /* =========================
     FETCH HALL DETAILS
  ========================= */
  useEffect(() => {
    if (!id) return;

    const fetchHall = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/halls/${id}`);
        const data = await res.json();
        console.log("HALL DATA:", data);
        setHall(data);
      } catch (err) {
        console.error("Failed to load hall details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id]);

  /* =========================
     FEATURE LABEL FORMATTER
  ========================= */
  const formatFeatureLabel = (key) => {
    const labels = {
      diningHall: "Dining Hall",
      stage: "Stage",
      powerBackup: "Power Backup",
      airConditioning: "Air Conditioning",
      nonAcHall: "Non-AC Hall",
      outsideFoodAllowed: "Outside Food Allowed",
      outsideDecoratorsAllowed: "Outside Decorators Allowed",
      outsideDjAllowed: "Outside DJ Allowed",
      alcoholAllowed: "Alcohol Allowed",
      valetParking: "Valet Parking",
    };

    return labels[key] || key;
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading hall details...</p>;
  }

  if (!hall) {
    return <p style={{ padding: 20 }}>Hall not found</p>;
  }

  /* =========================
     IMAGE HANDLING
  ========================= */
  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) => `http://localhost:5000${img}`)
      : [];

  /* =========================
     ACTIVE FEATURES
  ========================= */
  const activeFeatures = hall.features
    ? Object.entries(hall.features).filter(([_, v]) => v === true)
    : [];

  /* =========================
     🔥 PRICE PREPARATION
  ========================= */
  const pricePerEvent = Number(hall.pricePerEvent || 0);
  const pricePerDay = Number(hall.pricePerDay || 0);
  const pricePerPlate = Number(hall.pricePerPlate || 0);

  return (
    <div className="hall-detail-page hall-detail-spacing">

      {/* ================= TOP SECTION ================= */}
      <div className="hall-top">

        {/* IMAGE SECTION */}
        <div className="hall-images">
          {images.length > 0 ? (
            <img
              src={images[activeImage]}
              alt={hall.hallName}
              className="main-image"
            />
          ) : (
            <div className="no-image">No images uploaded</div>
          )}

          {images.length > 1 && (
            <div className="thumbs">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="hall-info">
          <h1 className="hall-name">{hall.hallName}</h1>

          <p className="location">
            📍 {hall.address?.area}, {hall.address?.city}
          </p>

          {/* 🔥 PREMIUM PRICE BLOCK */}
          <div className="price-block">

            {pricePerEvent > 0 && (
              <h2 className="price">
                ₹{pricePerEvent.toLocaleString()}
                <span> per event</span>
              </h2>
            )}

            {pricePerDay > 0 && (
              <h2 className="price secondary">
                ₹{pricePerDay.toLocaleString()}
                <span> per day</span>
              </h2>
            )}

            {pricePerPlate > 0 && (
              <h2 className="price secondary">
                ₹{pricePerPlate.toLocaleString()}
                <span> per plate</span>
              </h2>
            )}

            {pricePerEvent === 0 &&
              pricePerDay === 0 &&
              pricePerPlate === 0 && (
                <h2 className="price">₹N/A</h2>
              )}
          </div>

          <div className="meta">
            <span>👥 {hall.capacity || "N/A"} Capacity</span>
            <span>🚗 {hall.parkingCapacity || "N/A"} Parking</span>
            {hall.rooms && <span>🛏 {hall.rooms} Rooms</span>}
          </div>

          {hall.vendor?.phone && (
            <button
              className="contact-btn"
              onClick={() =>
                alert(`📞 Phone Number: ${hall.vendor.phone}`)
              }
            >
              View phone number
            </button>
          )}
        </div>
      </div>

      {/* FEATURES */}
      {activeFeatures.length > 0 && (
        <section className="hall-section">
          <h3>What this place has to offer</h3>
          <ul>
            {activeFeatures.map(([key]) => (
              <li key={key}>✔ {formatFeatureLabel(key)}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ABOUT */}
      {hall.about && (
        <section className="hall-section">
          <h3>Other Information</h3>
          <p>{hall.about}</p>
        </section>
      )}

      {/* ACTION BUTTONS */}
      <div className="hall-actions">
        <button className="back-btn" onClick={() => router.back()}>
          ← Back
        </button>

        <button
          className="book-btn"
          onClick={() => router.push(`/booking/${hall._id}`)}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}