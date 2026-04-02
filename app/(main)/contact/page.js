"use client";

import "./contact.css";
import Footer from "../../components/Footer";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_E164,
} from "../../../lib/siteContact";

export default function ContactPage() {
  return (
    <div className="contact-page">
      {/* HERO SECTION */}
      <div className="contact-hero">
        <div className="contact-overlay">
          <h1 className="gold-glow">Contact UTSAVAS</h1>
          <p>Where UTSAVAS Become Memories</p>
        </div>
      </div>

      {/* CONTACT CONTENT */}
      <div className="contact-container">
        <div className="contact-card">
          <h2 className="gold-glow">Get in Touch</h2>

          <div className="contact-item">
            <span>Mail</span>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </div>

          <div className="contact-item">
            <span>Support Number</span>
            <a href={`tel:${SUPPORT_PHONE_E164}`}>Call {SUPPORT_PHONE_DISPLAY}</a>
          </div>

          <div className="contact-item">
            <span>Address</span>
            <p>
              285/A, 14th Main Rd, Siddanna Layout, Banashankari Stage II,
              Bengaluru, Karnataka 560070
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
