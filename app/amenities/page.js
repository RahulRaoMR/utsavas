"use client";

import "./amenities.css";
import Footer from "../components/Footer";

const FEATURED_AMENITIES = [
  {
    title: "Grand Event Spaces",
    description:
      "Versatile indoor and outdoor venues suited for weddings, receptions, private gatherings, and corporate celebrations.",
  },
  {
    title: "Guest Capacity Planning",
    description:
      "Venue options with varied seating and standing capacities to support intimate functions as well as large-scale events.",
  },
  {
    title: "Parking Convenience",
    description:
      "Dedicated parking support across selected venues to improve guest arrival flow and event-day logistics.",
  },
  {
    title: "Premium Decor Flexibility",
    description:
      "Spaces designed to accommodate customized themes, floral styling, stage concepts, and event branding requirements.",
  },
  {
    title: "Dining & Catering Support",
    description:
      "Venue-ready dining areas and catering-friendly layouts for buffet service, plated events, and hospitality counters.",
  },
  {
    title: "Guest Comfort Essentials",
    description:
      "Comfort-focused venue features including air-conditioned halls, support spaces, and practical event utilities where available.",
  },
];

const HIGHLIGHTS = [
  "Elegant banquet and wedding-ready layouts",
  "Indoor and open-air celebration environments",
  "Vendor-friendly coordination support",
  "Amenity visibility before enquiry or booking",
];

const VISUALS = [
  {
    title: "Premium Wedding Layouts",
    image: "/gallery/g1.jpg",
  },
  {
    title: "Celebration Dining Ambience",
    image: "/gallery/g4.jpg",
  },
  {
    title: "Open-Air Event Experience",
    image: "/gallery/g6.jpg",
  },
];

export default function AmenitiesPage() {
  return (
    <div className="amenities-page">
      <section className="amenities-hero">
        <div className="amenities-overlay">
          <span className="amenities-eyebrow">UTSAVAS Venue Features</span>
          <h1>Amenities</h1>
          <p>
            Premium venue infrastructure and event-ready conveniences designed
            for modern celebrations and professional event planning.
          </p>
        </div>
      </section>

      <section className="amenities-intro">
        <div className="amenities-introCard">
          <div>
            <h2>Thoughtfully planned venue capabilities</h2>
            <p>
              UTSAVAS helps you discover spaces that combine visual appeal with
              operational comfort. From guest management and parking to decor
              flexibility and dining support, our venue listings are designed to
              help users evaluate more than just location and price.
            </p>
          </div>

          <div className="amenities-highlightPanel">
            <h3>What you can expect</h3>
            <ul>
              {HIGHLIGHTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="amenities-visualSection">
        <div className="amenities-visualGrid">
          {VISUALS.map((item) => (
            <article key={item.title} className="amenities-visualCard">
              <div
                className="amenities-visualImage"
                style={{ backgroundImage: `url("${item.image}")` }}
              />
              <div className="amenities-visualBody">
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="amenities-gridSection">
        <div className="amenities-gridWrap">
          <div className="amenities-sectionHeading">
            <h2>Featured Amenities</h2>
            <p>
              A premium overview of the kinds of facilities and venue
              advantages users typically look for on UTSAVAS.
            </p>
          </div>

          <div className="amenities-grid">
            {FEATURED_AMENITIES.map((item) => (
              <article key={item.title} className="amenity-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="amenities-cta">
        <div className="amenities-ctaCard">
          <h2>Choose venues with clarity and confidence</h2>
          <p>
            UTSAVAS is built to help families, planners, and organizers compare
            venue amenities before taking the next step. Browse listings,
            shortlist venues, and reach out for the details that matter most to
            your event.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
