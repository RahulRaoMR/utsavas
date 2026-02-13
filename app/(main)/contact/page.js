"use client";

import "./contact.css";

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
            <span>📧</span>
            <a href="mailto:utsavas26@gmail.com">
              utsavas26@gmail.com
            </a>
          </div>

          <div className="contact-item">
            <span>📞</span>
            <a href="tel:+911234567890">
              +91 1234567890
            </a>
          </div>

          <div className="contact-item">
            <span>📍</span>
            <p>
              285/A, 14th Main Rd, Siddanna Layout,  
              Banashankari Stage II, Bengaluru, Karnataka 560070
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
