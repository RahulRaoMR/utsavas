"use client";

import "./report-fraud.css";
import Footer from "../../components/Footer";

export default function ReportFraudPage() {
  return (
    <div className="fraud-page">
      <section className="fraud-hero">
        <div className="fraud-heroOverlay">
          <h1>Report a potential fraud</h1>
        </div>
      </section>

      <section className="fraud-content">
        <div className="fraud-card">
          <div className="fraud-grid">
            <div className="fraud-formWrap">
              <p className="fraud-note">Fields marked with * are required</p>

              <input className="fraud-input" type="text" placeholder="Your Name" />
              <input
                className="fraud-input"
                type="email"
                placeholder="Your email address"
              />
              <input className="fraud-input" type="tel" placeholder="Mobile Number" />
              <input
                className="fraud-input"
                type="text"
                placeholder="Name of the person / organization against whom concern is being raised"
              />
              <input className="fraud-input" type="text" placeholder="City" />
              <textarea
                className="fraud-textarea"
                rows={7}
                placeholder="Message"
              />

              <p className="fraud-disclaimerText">
                The reporting channel is used to report suspected fraudulent
                activity or serious misuse related to UTSAVAS. Please ensure the
                information shared by you is accurate and submitted in good
                faith.
              </p>
              <p className="fraud-disclaimerText">
                Avoid sharing sensitive payment data such as full card numbers,
                CVV, OTP, passwords, or unrelated personal information in this
                form.
              </p>

              <button className="fraud-button" type="button">
                Submit
              </button>
            </div>

            <aside className="fraud-sideCard">
              <h3>Disclaimer</h3>
              <p>
                Please use this form only for reporting suspected fraud,
                impersonation, deceptive behaviour, or misuse related to
                UTSAVAS.
              </p>
              <p>
                For general support, booking help, or service questions, please
                use the Help &amp; Support section instead.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
