"use client";

import Image from "next/image";
import "./services.css";

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
        </div>
      </section>

      {/* 🔽 CONTACT SECTION (THIS WAS MISSING) */}
      <section className="services-contact">
        <h2>Contact Us</h2>
        <p className="help-text">Need any help? Reach out to us</p>

        <p className="contact-item">
          Email :{" "}
          <a href="mailto:care@Talme.com">care@Talme.com</a>
        </p>

        <p className="contact-item">
          Phone :{" "}
          <a href="tel:8124222266">8124222266</a>
        </p>
      </section>
    </div>
  );
}
