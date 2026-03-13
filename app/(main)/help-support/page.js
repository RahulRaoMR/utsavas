"use client";

import "./help-support.css";
import Footer from "../../components/Footer";

export default function HelpSupportPage() {
  return (
    <div className="help-page">
      <section className="help-hero">
        <div className="help-heroOverlay">
          <h1>We would love to hear from you!</h1>
        </div>
      </section>

      <section className="help-content">
        <div className="help-grid">
          <div className="help-formCard">
            <select className="help-input" defaultValue="">
              <option value="" disabled>
                How can we help you?
              </option>
              <option>Venue booking support</option>
              <option>Vendor support</option>
              <option>Payment support</option>
              <option>Technical issue</option>
              <option>General enquiry</option>
            </select>

            <input className="help-input" type="text" placeholder="Full Name" />
            <input className="help-input" type="email" placeholder="Email Address" />
            <input
              className="help-input"
              type="tel"
              placeholder="Mobile Number (optional)"
            />
            <textarea
              className="help-textarea"
              placeholder="Type your message"
              rows={6}
            />

            <button className="help-button" type="button">
              Submit feedback
            </button>
          </div>

          <div className="help-side">
            <div className="help-infoCard">
              <h3>Need urgent assistance?</h3>
              <p>
                For immediate support related to venue enquiries, bookings, or
                customer assistance, contact the UTSAVAS team directly.
              </p>
              <a href="/contact">Contact here</a>
            </div>

            <div className="help-infoCard">
              <h3>Issue with your booking?</h3>
              <p>
                If you need help with an existing venue enquiry or booking, use
                this page or contact our support team with your booking details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
