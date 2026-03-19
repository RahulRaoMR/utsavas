import styles from "./ServicesSection.module.css";

const serviceCards = [
  {
    icon: "\uD83C\uDFDB\uFE0F",
    title: "Discover Wedding Venues",
    description:
      "Browse beautiful wedding halls and venues for every celebration.",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "Explore Decoration Themes",
    description:
      "Find venues offering elegant decor and customizable themes.",
  },
  {
    icon: "\uD83D\uDCC5",
    title: "Check Venue Availability",
    description:
      "Instantly check availability for your preferred event dates.",
  },
  {
    icon: "\uD83D\uDCB0",
    title: "Compare Pricing & Capacity",
    description:
      "Compare venues by budget, seating capacity, and included facilities.",
  },
  {
    icon: "\uD83D\uDCF8",
    title: "View Real Venue Photos",
    description:
      "See authentic venue photos before making your booking decision.",
  },
  {
    icon: "\uD83C\uDFB5",
    title: "Entertainment Options",
    description:
      "Find venues that support DJ, live music, and entertainment setups.",
  },
  {
    icon: "\uD83D\uDE97",
    title: "Parking & Facilities",
    description:
      "Check parking, guest rooms, and other venue amenities in one place.",
  },
  {
    icon: "\u26A1",
    title: "Quick Booking Requests",
    description:
      "Send inquiries fast and connect directly with venue owners.",
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <h2>Plan Your Celebration in One Place</h2>
      <p className={styles.subtitle}>
        Discover venues, explore services, and book everything you need for
        your special day all on UTSAVAM.
      </p>

      <div className={styles.grid}>
        {serviceCards.map((card) => (
          <div className={styles.card} key={card.title}>
            <div className={styles.icon}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
