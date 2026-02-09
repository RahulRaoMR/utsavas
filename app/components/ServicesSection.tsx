import styles from "./ServicesSection.module.css";

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <h2>What We Offer</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.icon}>🎉</div>
          <h3>Event Planning</h3>
          <p>End-to-end planning and coordination for seamless celebrations.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🌸</div>
          <h3>Wedding Decoration</h3>
          <p>Elegant décor themes crafted to match your vision and style.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🍽️</div>
          <h3>Catering Services</h3>
          <p>Curated menus with exceptional taste and premium presentation.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🎧</div>
          <h3>DJ & Entertainment</h3>
          <p>Professional DJs and entertainment to energize every moment.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>📸</div>
          <h3>Photography & Videography</h3>
          <p>Capture timeless moments with cinematic visuals and storytelling.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🚗</div>
          <h3>Valet Parking</h3>
          <p>Hassle-free and secure parking for a smooth guest experience.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🍸</div>
          <h3>Bar Counter</h3>
          <p>Stylish bar setups with professional service and premium beverages.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🎶</div>
          <h3>Live Music Band / Concert</h3>
          <p>Live performances that elevate the celebration atmosphere.</p>
        </div>
      </div>
    </section>
  );
}
