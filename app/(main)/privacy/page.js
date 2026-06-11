"use client";

import "./privacy.css";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-overlay">
          <h1>Privacy Policy</h1>
          <p>How UTSAVAS collects, uses, and protects your information</p>
        </div>
      </section>

      <section className="privacy-content">
        <div className="privacy-card">
          <h2>Privacy Policy - UTSAVAS</h2>
          <p className="privacy-updated">Last Updated: 11 June 2026</p>

          <h3>Introduction</h3>
          <p>
            UTSAVAS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
            committed to protecting the privacy of our users. This Privacy
            Policy explains how we collect, use, disclose, and safeguard
            information when you use the UTSAVAS mobile application and
            website.
          </p>

          <p>
            By using UTSAVAS, you agree to the collection and use of
            information in accordance with this Privacy Policy.
          </p>

          <h3>Information We Collect</h3>
          <p>We may collect the following information:</p>

          <h3>Personal Information</h3>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Mobile phone number</li>
            <li>Account login details</li>
            <li>Profile information provided by users</li>
          </ul>

          <h3>Booking Information</h3>
          <ul>
            <li>Venue booking details</li>
            <li>Event information</li>
            <li>Payment-related information</li>
          </ul>

          <h3>Device Information</h3>
          <ul>
            <li>Device type</li>
            <li>Operating system</li>
            <li>App version</li>
            <li>IP address</li>
            <li>Log data</li>
          </ul>

          <h3>Location Information</h3>
          <p>
            If location access is enabled by the user, we may collect location
            information to improve search results and provide nearby venue
            recommendations.
          </p>

          <h3>How We Use Information</h3>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide venue booking services</li>
            <li>Create and manage user accounts</li>
            <li>Process bookings and transactions</li>
            <li>Send booking confirmations and notifications</li>
            <li>Improve app performance and user experience</li>
            <li>Provide customer support</li>
            <li>Prevent fraud and misuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h3>Data Sharing</h3>
          <p>We do not sell user personal information.</p>
          <p>Information may be shared with:</p>
          <ul>
            <li>Venue owners and service providers involved in bookings</li>
            <li>Payment processing partners</li>
            <li>Technology and hosting service providers</li>
            <li>Government authorities when required by law</li>
          </ul>

          <h3>Data Security</h3>
          <p>
            We implement reasonable technical and organizational security
            measures to protect user information against unauthorized access,
            disclosure, alteration, or destruction.
          </p>

          <h3>Data Retention</h3>
          <p>
            We retain information only for as long as necessary to provide
            services, comply with legal obligations, resolve disputes, and
            enforce our agreements.
          </p>

          <h3>User Rights</h3>
          <p>Users may:</p>
          <ul>
            <li>Access their information</li>
            <li>Request corrections</li>
            <li>Request account deletion</li>
            <li>Contact us regarding privacy concerns</li>
          </ul>

          <h3>Third-Party Services</h3>
          <p>
            UTSAVAS may use third-party services such as analytics, payment
            gateways, cloud hosting providers, and communication services.
            These providers may process information according to their own
            privacy policies.
          </p>

          <h3>Children&apos;s Privacy</h3>
          <p>
            UTSAVAS is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children.
          </p>

          <h3>Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Changes will
            be posted on this page with an updated revision date.
          </p>

          <h3>Contact Us</h3>
          <p>
            If you have any questions regarding this Privacy Policy, please
            contact us:
          </p>

          <div className="privacy-contact">
            <p>
              <strong>UTSAVAS</strong>
            </p>
            <p>
              <strong>Email:</strong> support@utsavas.com
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a href="https://utsavas.com">https://utsavas.com</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
