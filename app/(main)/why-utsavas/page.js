"use client";

import "./why-utsavas.css";
import Footer from "../../components/Footer";

const PILLARS = [
  {
    title: "Curated Venue Quality",
    description:
      "UTSAVAS focuses on venue discovery with strong visual presentation, practical venue details, and event-first browsing that helps users compare with confidence.",
  },
  {
    title: "Celebration-Ready Discovery",
    description:
      "From wedding halls and banquet spaces to lawns, resorts, and party venues, the platform is structured around real event planning needs.",
  },
  {
    title: "Professional Planning Support",
    description:
      "Clear information on capacity, pricing, location, and amenities helps families, planners, and hosts make faster and more informed decisions.",
  },
];

export default function WhyUtsavasPage() {
  return (
    <div className="why-page">
      <section className="why-hero">
        <div className="why-overlay">
          <span className="why-eyebrow">Brand Advantage</span>
          <h1>Why UTSAVAS</h1>
          <p>
            A premium venue discovery experience designed for modern
            celebrations, trusted planning, and polished event execution.
          </p>
        </div>
      </section>

      <section className="why-showcase">
        <div className="why-showcaseGrid">
          <div className="why-storyCard">
            <h2>Built for thoughtful event decisions</h2>
            <p>
              UTSAVAS is designed to make venue selection feel structured,
              elevated, and efficient. Instead of browsing scattered options,
              users can explore curated venue categories, compare essential
              details, and move from discovery to enquiry with clarity.
            </p>
            <p>
              The platform supports a premium planning mindset by combining
              elegant presentation with practical information, helping users find
              spaces that align with both occasion and expectation.
            </p>
          </div>

          <div className="why-visualStack">
            <div
              className="why-visual large"
              style={{ backgroundImage: 'url("/gallery/g1.jpg")' }}
            />
            <div
              className="why-visual small"
              style={{ backgroundImage: 'url("/gallery/g6.jpg")' }}
            />
          </div>
        </div>
      </section>

      <section className="why-pillars">
        <div className="why-sectionHeading">
          <h2>What makes the experience different</h2>
          <p>
            Premium discovery is not only about aesthetics. It is also about
            how clearly users can evaluate, compare, and act.
          </p>
        </div>

        <div className="why-pillarsGrid">
          {PILLARS.map((item) => (
            <article key={item.title} className="why-pillarCard">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
