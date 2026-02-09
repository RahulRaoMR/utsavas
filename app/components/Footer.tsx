import styles from "./Footer.module.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left */}
        <div className={styles.brand}>
          <Image
            src="/logo/utsavaa-gold.png"
            alt="Utsavaa Logo"
            width={160}
            height={160}
          />

          <h4>Best Event Venue in Bangalore</h4>

          <p>
            Utsavaa brings together nature, elegance, and hospitality to create
            unforgettable spaces for life’s most cherished moments.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h5>Quick Links</h5>
          <ul>
            <li>Home</li>
            <li>Venues</li>
            <li>Amenities</li>
            <li>Events</li>
            <li>FAQs</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <h5>Get in Touch</h5>

          <p>📧 utsavas@gamail.com</p>
          <p>📞 +91 1234567890</p>
          <p>
            📍  285/A, 14th Main Rd, Siddanna Layout, Banashankari Stage II, Banashankari, Bengaluru, Karnataka 560070
          </p>

          <h5 className={styles.socialTitle}>Social Links</h5>
          <div className={styles.socials}>
            <span>f</span>
            <span>📷</span>
            <span>💬</span>
            <span>📌</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
