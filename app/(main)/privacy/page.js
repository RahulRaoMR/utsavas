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
          <h2>Privacy Policy of UTSAVAS</h2>
          <p>
            We are committed to your right to privacy and have prepared this
            Privacy Policy with regard to the information we collect from you.
            By using this website and/or by providing your information, you
            consent to the collection and use of the information you disclose on
            the website in accordance with this Privacy Policy, and you
            acknowledge that you are disclosing information voluntarily. If you
            do not agree with the use of your information, please do not use or
            access this website.
          </p>

          <p>
            We use secure systems for transactions and cookies may be used to
            store login information and improve your browsing experience.
            Cookies are small files placed on your device that help us provide
            our services. You may also encounter cookies or similar devices on
            certain pages of the website that are placed by third parties. We
            do not control the use of cookies by third parties.
          </p>

          <h3>What information you need to give to use this site</h3>
          <p>
            The information we gather from members, customers, and visitors who
            apply for or look for the services offered by our website may
            include email address, first name, last name, date of birth,
            password, mailing address, pin code, event details, and
            telephone/mobile number.
          </p>

          <p>
            If you establish a payment relationship with us for any charges,
            additional information such as billing address, payment details, and
            transaction tracking information may also be collected.
          </p>

          <h3>How the site uses the information it collects</h3>
          <p>
            We collect information from users primarily to fulfill requirements,
            improve the experience on the platform, process enquiries and
            bookings, provide customer support, and deliver a more personalized
            service.
          </p>

          <h3>With whom the site shares the information it collects</h3>
          <p>
            We do not sell, rent, or loan identifiable customer information to
            third parties. However, we may share relevant information with our
            associates, affiliates, subsidiaries, service providers, or legal
            authorities when required for service delivery, business operations,
            compliance, or as required by law.
          </p>

          <p>
            Our website may contain links to other websites that may collect
            personally identifiable information about you. We are not
            responsible for the privacy practices or content of those linked
            websites.
          </p>

          <h3>Change of Privacy Policy</h3>
          <p>
            We may change this Privacy Policy from time to time based on changes
            in our services, operations, legal requirements, or company
            policies. Updated versions will be effective when posted on this
            page.
          </p>

          <h3>How to address your grievance</h3>
          <p>
            For any grievance or privacy-related query, please contact UTSAVAS
            using the details below:
          </p>

          <div className="privacy-contact">
            <p>
              <strong>Email:</strong> utsavas26@gmail.com
            </p>
            <p>
              <strong>Phone:</strong> +91 80 4879 5189
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
