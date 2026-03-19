"use client";

import Image from "next/image";
import "./services.css";
import Footer from "../../components/Footer";

export default function ServicesPage() {
  return (
    <div className="services-page">
      {/* HERO */}
      <section className="services-hero">
        <Image
          src="/services-bg.jpg"   // your background image
          alt="UTSAVAS Services"
          fill
          className="hero-img"
        />

        <div className="hero-overlay">
          <h1>UTSAVAS Services</h1>
          <p>Where UTSAVAS Become Memories</p>
        </div>
      </section>

      {/* SERVICES CONTENT */}
      <section className="services-content">
        <h2>What We Offer</h2>

        <div className="services-grid">
          <div className="service-card">🎉 Event Planning</div>
          <div className="service-card">🌸 Wedding Decoration</div>
          <div className="service-card">🍽 Catering Services</div>
          <div className="service-card">🎧 DJ & Entertainment</div>
          <div className="service-card">📸 Photography & Videography</div>
          <div className="service-card">🚗 Valet Parking</div>
          <div className="service-card">🍸Bar Counter</div>
          <div className="service-card">🎶Live Music Band / Concert</div>
          <div className="service-card">🌿Mehndi</div>
          <div className="service-card">👰Bridal Wear</div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
