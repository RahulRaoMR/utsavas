"use client";

import "./faqs.css";
import Footer from "../../components/Footer";

const FAQS = [
  {
    question: "What is UTSAVAS?",
    answer:
      "UTSAVAS is a venue discovery and booking platform that helps users find wedding halls, banquet halls, party venues, resorts, farm houses, lawns, and other event spaces.",
  },
  {
    question: "How do I search for a venue on UTSAVAS?",
    answer:
      "You can use the search bar on the dashboard, browse venue categories, or open specific listing pages such as Wedding Halls, Banquet Halls, and Party Venues.",
  },
  {
    question: "Can I filter venues by location and budget?",
    answer:
      "Yes. UTSAVAS allows you to browse venues by city or location and use price filters on listing pages to narrow down options based on your event budget.",
  },
  {
    question: "Does UTSAVAS handle direct bookings?",
    answer:
      "UTSAVAS helps you discover venues, explore details, and send enquiries. Final booking terms, availability confirmation, and venue-specific commitments may depend on the listed venue or vendor.",
  },
  {
    question: "Can I see venue details before booking?",
    answer:
      "Yes. Each venue page can include images, location details, pricing, capacity, parking information, and other relevant event details to help you compare options.",
  },
  {
    question: "How do I contact UTSAVAS for support?",
    answer:
      "You can use the Help & Support page, the Contact page, or the footer contact details to reach the UTSAVAS team for assistance with enquiries or platform-related issues.",
  },
  {
    question: "Do I need an account to browse venues?",
    answer:
      "You can browse much of the platform without a full account, but some actions such as bookings, profile-related features, or enquiry workflows may require login or saved details.",
  },
  {
    question: "Can vendors list their halls on UTSAVAS?",
    answer:
      "Yes. Venue owners and vendors can register on the platform and submit their venue details for listing, subject to the platform's review and approval process.",
  },
  {
    question: "Are prices shown on UTSAVAS final?",
    answer:
      "Prices displayed on venue cards or detail pages are indicative based on the information available. Final pricing, taxes, package inclusions, and availability should be confirmed with the venue.",
  },
  {
    question: "What types of events can I plan using UTSAVAS?",
    answer:
      "UTSAVAS is suitable for weddings, receptions, engagement ceremonies, parties, private celebrations, corporate gatherings, and other event types depending on the venue category.",
  },
];

export default function FaqPage() {
  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="faq-overlay">
          <h1>Frequently Asked Questions</h1>
          <p>Helpful answers about venues, bookings, support, and UTSAVAS</p>
        </div>
      </section>

      <section className="faq-content">
        <div className="faq-card">
          <h2>FAQs</h2>
          <div className="faq-list">
            {FAQS.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
