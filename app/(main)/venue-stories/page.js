"use client";

import "./venue-stories.css";
import Footer from "../../components/Footer";

const STORIES = [
  {
    title: "Premium Venues",
    description: "Wedding-ready spaces",
    image: "/gallery/g1.jpg",
  },
  {
    title: "Resorts",
    description: "Destination-inspired stays",
    image: "/gallery/g2.jpg",
  },
  {
    title: "Banquet Halls",
    description: "Formal event environments",
    image: "/dashboard/banquet.jpg",
  },
  {
    title: "Farm Houses",
    description: "Private celebration settings",
    image: "/gallery/g3.jpg",
  },
  {
    title: "Convention Halls",
    description: "Large-format hosting",
    image: "/gallery/g4.jpg",
  },
  {
    title: "Kalyana Mandapams",
    description: "Traditional ceremony spaces",
    image: "/gallery/g5.jpg",
  },
  {
    title: "Destination Weddings",
    description: "Scenic signature events",
    image: "/gallery/g6.jpg",
  },
  {
    title: "Lawns",
    description: "Open-air celebrations",
    image: "/gallery/g7.jpg",
  },
];

export default function VenueStoriesPage() {
  return (
    <div className="stories-page">
      <section className="stories-hero">
        <div className="stories-overlay">
          <span className="stories-eyebrow">Venue Perspective</span>
          <h1>Venue Stories</h1>
          <p>
            A curated look at how different venue types support weddings,
            celebrations, hosted gatherings, and premium event experiences.
          </p>
        </div>
      </section>

      <section className="stories-gridSection">
        <div className="stories-grid">
          {STORIES.map((item) => (
            <article key={item.title} className="story-card">
              <div
                className="story-image"
                style={{ backgroundImage: `url("${item.image}")` }}
              >
                <div className="story-imageOverlay" />
              </div>
              <div className="story-body compact">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stories-summary">
        <div className="stories-summaryCard">
          <h2>Designed to support better venue selection</h2>
          <p>
            UTSAVAS is not only a directory of spaces. It is a planning-oriented
            discovery layer that helps users understand how venue environments,
            amenities, and presentation styles align with the type of event they
            want to host.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
