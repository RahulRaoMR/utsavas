import Footer from "../../components/Footer";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "../../../lib/siteContact";
import "./account-deletion.css";

const mailSubject = "UTSAVAS account deletion request";
const mailBody =
  "Please delete my UTSAVAS account and associated personal data.\n\nRegistered email or phone:\nFull name:\n";

export default function AccountDeletionPage() {
  return (
    <div className="account-deletion-page">
      <section className="account-deletion-hero">
        <div className="account-deletion-overlay">
          <h1>UTSAVAS Account Deletion</h1>
          <p>
            Request deletion of your UTSAVAS app account and associated data.
          </p>
        </div>
      </section>

      <section className="account-deletion-content">
        <div className="account-deletion-card">
          <h2>Delete your account</h2>
          <p>
            UTSAVAS is operated by TALME Technologies Pvt Ltd. If you have
            created an account in the UTSAVAS Android app or on utsavas.com, you
            can request account deletion using the steps below.
          </p>

          <h3>How to request deletion</h3>
          <ol>
            <li>
              Send an email to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  mailSubject
                )}&body=${encodeURIComponent(mailBody)}`}
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              with the subject &quot;UTSAVAS account deletion request&quot;.
            </li>
            <li>
              Include the email address or phone number used for your UTSAVAS
              account so we can verify the account.
            </li>
            <li>
              We may contact you to confirm ownership before deleting the
              account.
            </li>
          </ol>

          <h3>Data deleted</h3>
          <p>
            After verification, we delete or anonymize your UTSAVAS account
            profile, login credentials, saved contact details, app preferences,
            and personal booking enquiry details associated with your account.
          </p>

          <h3>Data retained</h3>
          <p>
            We may retain records that are required for legal, tax, security,
            fraud prevention, dispute resolution, or transaction compliance
            purposes. Retained records are kept only for the period required by
            applicable law or legitimate business obligations.
          </p>

          <h3>Processing time</h3>
          <p>
            Account deletion requests are normally processed within 7 business
            days after successful verification.
          </p>

          <div className="account-deletion-contact">
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <p>
              <strong>Support number:</strong> {SUPPORT_PHONE_DISPLAY}
            </p>
            <p>
              <strong>Developer:</strong> TALME Technologies Pvt Ltd
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
