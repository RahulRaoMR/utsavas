"use client";

import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter(); 

  const handleRedirect = (path: string) => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (token) {
      router.push(path);
    } else {
     /// router.push(`/login?redirect=${encodeURIComponent(path)}`);///
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Left */}
        <div className={styles.brand}>
          <Image
            src="/logo/utsavaa-gold.png"
            alt="Utsavas Logo"
            width={160}
            height={160}
          />

          <h4>Best Event Venue in Bangalore</h4>

          <p>
            Utsavas brings together nature, elegance, and hospitality to create
            unforgettable spaces for life’s most cherished moments.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h5>Quick Links</h5>
          <ul>
            <li onClick={() => handleRedirect("/")}>Home</li>
            <li onClick={() => handleRedirect("/dashboard")}>Venues</li>
            <li onClick={() => handleRedirect("/dashboard")}>Amenities</li>
            <li onClick={() => handleRedirect("/services")}>Events</li>
            <li onClick={() => handleRedirect("/faqs")}>FAQs</li>
            <li onClick={() => handleRedirect("/services")}>Contact Us</li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <Link href="/contact" className={styles.contactTitleLink}>
            <h5>Get in Touch</h5>
          </Link>

          <p>
            📧{" "}
            <Link href="/contact" className={styles.contactLink}>
              utsavas26@gmail.com
            </Link>
          </p>

          <p>
            📞{" "}
            <Link href="/contact" className={styles.contactLink}>
              +91 1234567890
            </Link>
          </p>

          <p>
            📍 285/A, 14th Main Rd, Siddanna Layout, Banashankari Stage II,
            Banashankari, Bengaluru, Karnataka 560070
          </p>

          <h5 className={styles.socialTitle}>Social Links</h5>
          <div className={styles.socials}>
            <a
              href="https://www.instagram.com/utsavas?igsh=OWliZDVxMjVvOGJ0"
              target="_blank"
              rel="noopener noreferrer"
            >
              📷
            </a>

            <a
              href="https://www.youtube.com/channel/UCvnp8ihWb7QzbDASj8AKyyQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶️
            </a>

            <a
              href="https://x.com/utsavas26"
              target="_blank"
              rel="noopener noreferrer"
            >
              🐦
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61587886567668"
              target="_blank"
              rel="noopener noreferrer"
            >
              f
            </a>
          </div>
        </div>
      </div>

      {/* ✅ FOOTER BOTTOM — FIXED */}
      <div className={styles.footerBottom}>
        <p className={styles.footerTagline}>
          Utsavas.com is part of Talme Technologies Inc., Where Every Utsavam
          Becomes a Beautiful Memory
        </p>

        <p className={styles.footerCopy}>
          Copyright © 2012–2026 Talme.com™. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
