"use client";

import "./about-us.css";
import Footer from "../../components/Footer";

export default function AboutUsPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-overlay">
          <h1>About Us</h1>
          <p>Learn more about UTSAVAS and our vision</p>
        </div>
      </section>

      <section className="about-content">
        <div className="about-card">
          <h2>About UTSAVAS</h2>
          <p>
            UTSAVAS is a premium venue discovery and booking platform built to
            help people find the right space for weddings, celebrations,
            parties, receptions, and special events with ease.
          </p>

          <p>
            We bring together a curated collection of event spaces including
            wedding halls, banquet halls, resorts, farm houses, party venues,
            convention halls, lawns, and destination wedding spaces across
            Karnataka and beyond, with options suited to different styles,
            capacities, and budgets.
          </p>

          <p>
            Our goal is to simplify venue discovery by helping families,
            couples, and event planners compare the right options in one place.
            From elegant indoor celebrations to open-air events, UTSAVAS is
            designed to make the venue selection process faster, clearer, and
            more reliable.
          </p>

          <p>
            We are a passionate team focused on making celebration planning feel
            smooth and personal. Our mission is to help you discover the right
            venue for your event with the same care and attention you would
            expect from a trusted planning partner.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
