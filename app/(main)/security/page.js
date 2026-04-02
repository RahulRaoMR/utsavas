"use client";

import "./security.css";
import Footer from "../../components/Footer";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "../../../lib/siteContact";

export default function SecurityPage() {
  return (
    <div className="security-page">
      <section className="security-hero">
        <div className="security-overlay">
          <h1>Security</h1>
          <p>Help keep UTSAVAS safe for our users and community</p>
        </div>
      </section>

      <section className="security-content">
        <div className="security-card">
          <h2>Security at UTSAVAS</h2>
          <p>
            We take security seriously at UTSAVAS. If you are a security
            researcher, developer, or expert and believe you have identified a
            security-related issue in the UTSAVAS website, application, or
            services, we encourage you to disclose it to us responsibly.
          </p>

          <p>
            Our team is committed to reviewing and addressing security issues in
            a responsible and timely manner. We request the security community
            to give us the opportunity to investigate and resolve potential
            issues before disclosing them publicly.
          </p>

          <p>
            Please share the issue with us along with a clear description of the
            vulnerability, the affected page or feature, and steps to reproduce
            it, if available. Supporting screenshots, videos, proof-of-concept
            details, and severity notes will help us investigate faster.
          </p>

          <p>
            We appreciate the efforts of researchers and contributors who help
            us protect our users, their data, and their privacy by reporting
            issues responsibly.
          </p>

          <div className="security-contact">
            <h3>Report a security issue</h3>
            <p>
              <strong>Email:</strong> {SUPPORT_EMAIL}
            </p>
            <p>
              <strong>Support number:</strong> {SUPPORT_PHONE_DISPLAY}
            </p>
            <p>
              <strong>Address:</strong> 285/A, 14th Main Rd, Siddanna Layout,
              Banashankari Stage II, Banashankari, Bengaluru, Karnataka 560070
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
