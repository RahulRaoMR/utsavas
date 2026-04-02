"use client";

import "./contact.css";
import Footer from "../../components/Footer";

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
            <a href="mailto:utsavas26@gmail.com">utsavas26@gmail.com</a>
          </div>

          <div className="contact-item">
            <a href="tel:+918048795189">+91 80 4879 5189</a>
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
