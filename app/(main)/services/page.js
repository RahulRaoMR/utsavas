"use client";

import Image from "next/image";
import "./services.css";
import Footer from "../../components/Footer";

const serviceCards = [
  {
    icon: "\uD83C\uDFDB\uFE0F",
    title: "Discover Wedding Venues",
    description:
      "Browse beautiful wedding halls and venues for every celebration.",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "Explore Decoration Themes",
    description:
      "Find venues offering elegant decor and customizable themes.",
  },
  {
    icon: "\uD83D\uDCC5",
    title: "Check Venue Availability",
    description:
      "Instantly check availability for your preferred event dates.",
  },
  {
    icon: "\uD83D\uDCB0",
    title: "Compare Pricing & Capacity",
    description:
      "Compare venues by budget, seating capacity, and included facilities.",
  },
  {
    icon: "\uD83D\uDCF8",
    title: "View Real Venue Photos",
    description:
      "See authentic venue photos before making your booking decision.",
  },
  {
    icon: "\uD83C\uDFB5",
    title: "Entertainment Options",
    description:
      "Find venues that support DJ, live music, and entertainment setups.",
  },
  {
    icon: "\uD83D\uDE97",
    title: "Parking & Facilities",
    description:
      "Check parking, guest rooms, and other venue amenities in one place.",
  },
  {
    icon: "\u26A1",
    title: "Quick Booking Requests",
    description:
      "Send inquiries fast and connect directly with venue owners.",
  },
];

export default function ServicesPage() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <Image
          src="/services-bg.jpg"
          alt="UTSAVAS Services"
          fill
          className="hero-img"
        />

        <div className="hero-overlay">
          <h1>Explore UTSAVAS</h1>
          <p>Compare venues, discover amenities, and book with confidence.</p>
        </div>
      </section>

      <section className="services-content">
        <div className="services-copy">
          <span className="services-eyebrow">Venue Discovery</span>
          <h2>What We Offer</h2>
          <p>
            Everything you need to shortlist the right venue faster, compare
            options clearly, and send booking requests in just a few clicks.
          </p>
        </div>

        <div className="services-grid">
          {serviceCards.map((card) => (
            <article className="service-card" key={card.title}>
              <span className="service-icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
